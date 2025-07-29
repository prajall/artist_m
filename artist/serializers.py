from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from query.sql.utils import *
from user.serializers import UserSerializer

class ArtistSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    user_id = serializers.IntegerField()
    artist_name = serializers.CharField(min_length = 3)
    first_release_year = serializers.DateTimeField()

    def create(self, validated_data):

        try:
            artist_exist = fetch_one("artist/get_artist_exists.sql",[validated_data["user_id"]])
            print ("ARtist exists", artist_exist)
            
        
        except Exception as e:
            print("Error findind artist",e)
            return None
        
        if artist_exist['exists']:
            raise ValidationError("Artist Already Exists")

        params = [
            validated_data['user_id'],
            validated_data['artist_name'],
            validated_data['first_release_year'],
        ]

        new_artist = execute_sql("artist/insert_artist.sql",params, fetch_one=True)
        print("New Artist",new_artist)

        return new_artist


class ArtistListSerializer( ArtistSerializer, UserSerializer):
   artist_id = serializers.IntegerField(read_only=True)
   user_id = serializers.IntegerField(read_only=True)
