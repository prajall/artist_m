from rest_framework.views import APIView
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *
from user.permissions import *
from app.utils import api_response, api_error



class SongListCreateView(APIView):

    permission_classes = [IsAuthenticated, IsArtistOrReadOnly]
    
    def post(self, request):
        data = request.data.copy()
        data['user_id'] = request.user.id

        try:
            artist = fetch_one("artist/get_artist_by_user_id.sql", [request.user.id])
            data['artist_id'] = artist['id']
            
            serializer = SongSerializer(data=data)
            if not serializer.is_valid():
                return api_error(400, "Validation failed for provided details", serializer.errors)
            serializer.save()
            return api_response(201, "Song created successfully", serializer.data)

        except Exception as e:
            print("Error creating song", e)
            return api_error(500, "Internal server error", str(e))

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
                artist = fetch_one("artist/get_artist_by_user_id.sql", [request.user.id])
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
            return api_response(200, "Songs fetched successfully", songs)
        except Exception as e:
            print("Error fetching songs", e)
            return api_error(500, "Internal server error", str(e))