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
    created_at = serializers.DateTimeField(read_only = True)
    updated_at= serializers.DateTimeField(read_only = True)


    def validate_email(self, value):
        result = fetch_one("users/get_email.sql", [value])
        print("-------validating email-------", result)
        if result and result["exists"]:
            raise serializers.ValidationError("Email Already Exists")
        return value


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
        ]
        new_user = execute_sql("users/insert_user.sql",params)
        print("New User ", new_user)
        return new_user
    
     

class LoginSerializer(serializers.Serializer, TokenMixin):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data['email']
        password = data['password']

        user = fetch_one("users/get_user_by_email.sql",[email])
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
    # access = serializers.CharField()
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
        
        
        print("Decoded user",user)
        return {"access":access}
