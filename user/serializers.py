from rest_framework import serializers
from query.sql.utils import fetch_one, execute_sql
from django.contrib.auth.hashers import make_password,check_password
import jwt
from django.conf import settings
from datetime import datetime

ROLE_CHOICE = (
    ('super_admin','Super Admin'),
    ('artist_manager','Artist Manager'),
    ('artist','Artist'),
    ('user','User'),
)

GENDER_CHOICE = (
    ('male','Male'),
    ('female','Female'),
    ('other','Other'),
)

class TokenMixin:
    def generate_access_token(self, user):
        payload = {
            "email":user['email'],
            "first_name":user['first_name'],
            "last_name":user['last_name'],
            "role":user['role'],
            "exp":  datetime.now() + settings.ACCESS_TOKEN_LIFETIME, 
        }
        try:
            token = jwt.encode(payload,settings.SECRET_KEY,"HS256")
        except jwt.InvalidSignatureError:
            raise(serializers.ValidationError("Invalid signature"))

        return token
    
    def generate_refresh_token(self, user):
        payload = {
            "email":user['email'],
            "first_name":user['first_name'],
            "last_name":user['last_name'],
            "role":user['role'],
            "exp":  datetime.now() + settings.REFRESH_TOKEN_LIFETIME, 
        }
        try:
            token = jwt.encode(payload,settings.SECRET_KEY,"HS256")
        except jwt.InvalidSignatureError:
            raise(serializers.ValidationError("Invalid signature"))

        return token
    

class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only = True)
    first_name = serializers.CharField(min_length = 3)
    last_name = serializers.CharField(min_length = 3)
    role = serializers.ChoiceField(choices = ROLE_CHOICE, default = "user")
    phone = serializers.CharField(min_length = 10)
    gender = serializers.ChoiceField(choices = GENDER_CHOICE)
    address = serializers.CharField()
    dob = serializers.DateField()
    profile_image = serializers.ImageField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only = True)
    updated_at= serializers.DateTimeField(read_only = True)


    def validate_email(self, value):
        result = fetch_one("user/get_email.sql", [value])
        if result and result["exists"]:
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be atleast 8 characters long")
        return value

    def validate_phone(self, value):
        if not len(value) == 10:
            raise serializers.ValidationError("Phone number must be 10 characters long")
        
        for char in value:
            if not char.isdigit():
                raise serializers.ValidationError("Phone number must contain only digits")
        return value
    
    def validate_profile_image(self, image):
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = image.name.split('.')[-1].lower()

        if ext not in allowed_extensions:
            raise serializers.ValidationError("File type must be jpg, jpeg, png, or webp.")

        if image.size > 10 * 1024 * 1024:  # 10MB
            raise serializers.ValidationError("File size must be less than 10MB.")

        return image
        
    


    def create(self, validated_data):
        hashed_password = make_password(validated_data['password'])
        params = [
            validated_data['email'],
            hashed_password,
            validated_data['first_name'],
            validated_data['last_name'],
            validated_data['role'],
            validated_data['phone'],
            validated_data['gender'],
            validated_data['address'],
            validated_data['dob'],
            validated_data['profile_image']
        ]

        new_user = execute_sql(path="user/insert_user.sql",params=params, fetch_one=True)
        print("New User ", new_user)
        return new_user
    
        
    def update(self, instance, validated_data):

        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])

        new_data = validated_data.items()
        columns = []
        params = {}
        allowed_fields = ['first_name','last_name','phone','dob','address','gender']

        for (key, value) in new_data:
            if key not in allowed_fields:
                print("invalid key",key)
                continue
            columns.append(f"{key} = %({key})s")
            params[key] = value

        columns.append("updated_at = NOW()")
        params['id'] = instance['id']

        # [
        #   "first_name = %(first_name)s"
        #   "last_name = %(last_name)s"
        # ]

        # { first_name = Prajal, last_name = Maharjan }

        
        query = f"""
            UPDATE Users
            SET {", ".join(columns)}
            WHERE id = %(id)s
            RETURNING id, email, first_name, last_name, phone, dob, address, gender, role
        """
        updated_user = execute_sql(query=query, params=params, fetch_one=True)
        print("Updated User ", updated_user)
        return updated_user

class LoginSerializer(serializers.Serializer, TokenMixin):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data['email']
        password = data['password']

        user = fetch_one("user/get_user_by_email.sql",[email])
        print("User fetch_one response",user['password'])

        if not user:
            raise serializers.ValidationError("User not found")
        
        if not check_password(password, user['password']):
            raise serializers.ValidationError("Incorrect Password")
        
     
        access_token = self.generate_access_token(user)
        refresh_token = self.generate_refresh_token(user)
               
        data["user"]={
            "email":user['email'],
            "first_name":user['first_name'],
            "last_name":user['last_name'],
            "role":user['role']
        }
        data["access_token"]=access_token,
        data["refresh_token"]=refresh_token

        return data
    

class RefreshSerializer(serializers.Serializer, TokenMixin):
    refresh = serializers.CharField()

    def validate(self, data):
        refresh_token = data['refresh']
        if not refresh_token:
            raise(serializers.ValidationError("Refresh Token is required"))
        try:
            user = jwt.decode(refresh_token,settings.SECRET_KEY,"HS256" )
        except jwt.ExpiredSignatureError:
            raise(serializers.ValidationError("Refresh token expired"))
        except jwt.InvalidTokenError:
            raise(serializers.ValidationError("Invalid token"))
        
        if not user:
            raise(serializers.ValidationError("Invalid/No User"))
        
        access = self.generate_access_token(user)
        
        return {"access":access}
