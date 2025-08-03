from rest_framework import serializers
from query.sql.utils import fetch_one
from query.sql.utils import execute_sql, fetch_many_dict, fetch_one

class SongSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    artist_id = serializers.IntegerField()
    title = serializers.CharField()
    album_name = serializers.CharField(min_length = 3)
    genre = serializers.CharField(default = "Music")
    song_cover = serializers.CharField(required=False, allow_blank=True)
    
    # def validate(self, attrs):
    #     user_id = self.context["user_id"]
    #     artist = fetch_one("artist/get_artist_by_user_id.sql", [user_id])
    #     if not artist:
    #         raise serializers.ValidationError("Artist not found for this user.")
    #     attrs["artist_id"] = artist["id"]
    #     return attrs

    # def validate_artist_id(self, value):
    #     artist = fetch_one("artist/get_artist_by_user_id.sql", [self.user_id])
    #     print("ARtist",artist)
    #     if not artist:
    #         raise serializers.ValidationError("Artist with this ID does not exist")
    #     return artist["id"]
    
    def create(self, validated_data):
        params = {
            "title":validated_data.get('title'),
            "artist_id":validated_data.get('artist_id'),
            "album_name":validated_data.get('album_name'),
            "genre":validated_data.get('genre'),
            "song_cover":validated_data.get('song_cover')
        }
        new_song = execute_sql(path="song/insert_song.sql",params=params, fetch_one=True)
        print("New Song",new_song)
        return new_song