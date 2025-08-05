from rest_framework import serializers
from query.sql.utils import fetch_one, execute_sql
from app.utils import save_image_file

class AlbumSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    album_name = serializers.CharField(min_length=3)
    album_cover = serializers.ImageField(required=False)
    artist_id = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def validate(self, data):
        allowed_fields = ['album_name', 'album_cover']
        if not any(field in data for field in allowed_fields):
            raise serializers.ValidationError("No valid fields found in request data.")
        return data

    def validate_album_cover(self, file):
        print("album cover File",file)
        return save_image_file(file, "album_cover")
    
    def create(self, validated_data):
        try:
            params = {
                "album_name":validated_data.get('album_name'),
                "artist_id":validated_data.get('artist_id'),
                "album_cover":validated_data.get('album_cover')
            }
            new_album = execute_sql(
                path="album/insert_album.sql",
                params=params, 
                fetch_one=True
            )
            print("New Album",new_album)
            return new_album

        except Exception as e:
            print("Error creating album:", e)
            raise serializers.ValidationError("Failed to create album. Please try again.")
    
    def update(self, instance, validated_data):
        
        try:
            
            field_values= []
                
            print("Album instance", instance)
            
            allowed_fields = ['album_name','album_cover']

            for field, value in validated_data.items():
                if field not in allowed_fields:
                    continue
                field_values.append(f"{field} = '{value}'")

            query = f"""
                UPDATE Albums
                SET {', '.join(field_values)}
                WHERE id = {instance['id']}
                RETURNING *
            """
            updated_album = execute_sql(query=query, fetch_one=True)
            print("Updated album",updated_album)
            return updated_album
        
        except Exception as e:
            print("Error updating album:", e)
            raise serializers.ValidationError("Failed to update album. Please try again.")


class AlbumSongSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    album_id = serializers.IntegerField()
    song_id = serializers.IntegerField()