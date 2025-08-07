from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from query.sql.utils import *
from user.serializers import UserSerializer

class ArtistSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    user_id = serializers.IntegerField()
    artist_name = serializers.CharField(min_length = 3)
    manager_id = serializers.IntegerField()
    first_release_year = serializers.DateField()
    no_of_albums_released = serializers.IntegerField(min_value=0,read_only=True, default=0)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate_user_id(self, value):
        user = fetch_one("user/fetch_user_detail.sql", [value])
        if not user:
            raise serializers.ValidationError("User with this ID does not exist")
        if not user['role'] == 'user':    
            raise serializers.ValidationError("User with this has a different role")
        if fetch_one("artist/get_artist_by_user_id.sql", [value]):
            raise serializers.ValidationError("Artist with this User ID already exists")
        return value

    def validate_manager_id(self, value):

        print("context", self.context)
        user = self.context.get("user")

        manager_exists = fetch_one("user/get_artist_manager_exists.sql", [value])
        if not manager_exists['exists']:
            raise serializers.ValidationError("Artist manager with this ID does not exist")

        if user.role == "artist":
            raise serializers.ValidationError("Artist cannot assign artist manager")

        if user.role == "artist_manager":
            if value != user.id:
               raise serializers.ValidationError("You can only assign yourself as the manager.")
            return user.id
        
        if user.role == "super_admin":
            return value

        raise serializers.ValidationError("Unauthorized role.")

    def create(self, validated_data):

        try:
            params = {
                "user_id" : validated_data['user_id'],
                "artist_name":validated_data['artist_name'],
                "manager_id": validated_data['manager_id'],
                "first_release_year": validated_data['first_release_year'],
            }
            print("Params for insert artist:", params)
            new_artist = execute_sql(path="artist/insert_artist.sql",params=params, fetch_one=True)
            print("New Artist",new_artist)

            execute_sql("artist/set_role_to_artist.sql", [validated_data['user_id']])

            return new_artist
        
        except Exception as e:
            print("Error findind artist",e)
            return None
    
    def update(self, instance, validated_data):
        try:
            field_values= []

            for field, value in validated_data.items():
                field_values.append(f"{field} = '{value}'")  
                
            # params = {
            #     "artist_name":validated_data['artist_name'],
            #     "manager_id": validated_data['manager_id'],
            #     "first_release_year": validated_data['first_release_year'],
            # }

            query = f"""
                UPDATE Artists
                SET {', '.join(field_values)}
                WHERE id = {instance['id']}
                RETURNING *
            """
            updated_artist = execute_sql(query=query, fetch_one=True)
            print("Updated Artist",updated_artist)
            return updated_artist
        except Exception as e:
            print("Error updating artist",e)
            return None
        



class ArtistListSerializer( ArtistSerializer, UserSerializer):
   artist_id = serializers.IntegerField(read_only=True)
   user_id = serializers.IntegerField(read_only=True)
