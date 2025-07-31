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
        manager_exists = fetch_one("user/get_artist_manager_exists.sql", [value])
        if not manager_exists['exists']:
            raise serializers.ValidationError("Artist manager with this ID does not exist")
        return value

    def create(self, validated_data):

        try:
            params = [
                validated_data['user_id'],
                validated_data['artist_name'],
                validated_data['manager_id'],
                validated_data['first_release_year'],
            ]
            print("Params for insert artist:", params)
            new_artist = execute_sql(path="artist/insert_artist.sql",params=params, fetch_one=True)
            print("New Artist",new_artist)

            execute_sql("artist/set_role_to_artist.sql", [validated_data['user_id']])

            return new_artist
        
        except Exception as e:
            print("Error findind artist",e)
            return None
        



class ArtistListSerializer( ArtistSerializer, UserSerializer):
   artist_id = serializers.IntegerField(read_only=True)
   user_id = serializers.IntegerField(read_only=True)
