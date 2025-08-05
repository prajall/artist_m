from rest_framework import serializers
from query.sql.utils import fetch_one
from query.sql.utils import execute_sql, fetch_many_dict, fetch_one
from app.utils import save_image_file


class SongSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    artist_id = serializers.IntegerField()
    title = serializers.CharField()
    genre = serializers.CharField(default = "Music")
    song_cover = serializers.ImageField(required=False)
    album_id = serializers.IntegerField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def validate_song_cover(self, file):
        return save_image_file(file, "song_cover")
    
    def validate_album_id(self, value):
        if not fetch_one("album/get_album_by_id.sql", {"album_id":value}):
            raise serializers.ValidationError("Album with this ID does not exist")
        return value
    
    def create(self, validated_data):
        try:
       
            params = {
                "title":validated_data.get('title'),
                "artist_id":validated_data.get('artist_id'),
                "album_name":validated_data.get('album_name'),
                "genre":validated_data.get('genre'),
                "song_cover":validated_data.get('song_cover')
            }
            new_song = execute_sql(
                path="song/insert_song.sql",
                params=params, 
                fetch_one=True
            )
            print("New Song",new_song)
            return new_song

        except Exception as e:
            print("Error creating song:", e)
            raise serializers.ValidationError("Failed to create song. Please try again.")

    
    def update(self, instance, validated_data):
        try:
            
            field_values= []
            
            print("Song instance", instance)

            for field, value in validated_data.items():
                field_values.append(f"{field} = '{value}'")
                
            query = f"""
                UPDATE Songs
                SET {', '.join(field_values)}
                WHERE id = {instance['id']}
                RETURNING *
            """
            updated_song = execute_sql(query=query, fetch_one=True)
            print("Updated Song",updated_song)
            return updated_song

        except Exception as e:
            print("Error updating artist",e)
            return None
        