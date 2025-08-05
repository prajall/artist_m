from rest_framework.views import APIView
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *
from user.permissions import *
from app.utils import api_response, api_error
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser


class SongListCreateView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated, IsArtist]
    
    def post(self, request):
        data = request.data.copy()
        data['user_id'] = request.user.id

        try:
            artist = fetch_one("artist/get_artist_by_user_id.sql", [request.user.id])
            data['artist_id'] = artist['id']
            
            serializer = SongSerializer(data=data, context={"user_id": request.user.id})
            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", serializer.errors)
            new_song = serializer.save()
            return api_response(status.HTTP_201_CREATED, "Song created successfully", new_song)

        except Exception as e:
            print("Error creating song", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")

    def get (self, request):
        try:
            user_id = request.user.id
            user_role = request.user.role
            
            manager_id = (request.GET.get("manager_id",None))
            artist_id = (request.GET.get("artist_id",None))
            limit = int(request.GET.get("limit", 12))
            page = int(request.GET.get("page", 1))
            songs=[]

            if user_role == 'artist':
                artist = fetch_one("artist/get_artist_by_user_id.sql", [user_id])
                artist_id = artist.get("id")
                songs = fetch_many_dict(path="song/fetch_songs.sql", params={
                    "artist_id":artist_id, 
                    "manager_id":artist.get('manager_id',None),
                    "limit":limit, 
                    "page":page,
                })
                
            if user_role == 'artist_manager':
                songs = fetch_many_dict(path="song/fetch_songs.sql", params={
                    "artist_id":artist_id,
                    "manager_id":user_id,
                    "limit":limit, 
                    "page":page
                })

            if user_role == 'super_admin':
                songs = fetch_many_dict(path="song/fetch_songs.sql", 
                params={
                    "artist_id":artist_id,
                    "manager_id":manager_id,
                    "limit":limit, 
                    "page":page
                })
            return api_response(status.HTTP_200_OK, "Songs fetched successfully", songs)
        except Exception as e:
            print("Error fetching songs", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")
        
class SongDetailView(APIView):

    permission_classes = [IsAuthenticated, IsArtistOrReadOnly]

    def get_object(self, song_id):
        try:
            song = fetch_one("song/get_song_by_id.sql", {"id":song_id})
            return song
        except Exception as e:
            print("Error fetching song", e)
            return None
        
    def get(self,request,song_id):
        try:
            song = self.get_object(song_id)
            if not song:
                return api_error(status.HTTP_404_NOT_FOUND,"Song not found")
            return api_response(status.HTTP_200_OK, "Song detail fetched successfully", song)

        except (PermissionDenied, NotAuthenticated) as e:
           return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error fetching song",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
    
    def patch(self, request, song_id):
        try:
            song = self.get_object(song_id)
            if not song:
                return api_error(status.HTTP_404_NOT_FOUND,"Song not found")

            self.check_object_permissions(request, song)

            serializer = SongSerializer(data=request.data, instance = song,context={"user_id": request.user.id} ,partial=True)

            print("hdfhdhfdh")

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", serializer.errors)
            serializer.save()
            return api_response(status.HTTP_200_OK, "Song updated successfully", serializer.data)

        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        
        except Exception as e:
            print("Error updating song",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")

    
    def delete(self, request, song_id):
        try:
            song = self.get_object(song_id)
            if not song:
                return api_error(status.HTTP_404_NOT_FOUND,"Song not found")
            self.check_object_permissions(request, song)
            execute_sql("song/delete_song.sql", {"id":song_id})
            return api_response(status.HTTP_204_NO_CONTENT, "Song deleted successfully")
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        
        except Exception as e:
            print("Error updating song",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
     