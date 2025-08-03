from rest_framework.views import APIView
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *
from user.permissions import IsManagerOrReadOnly
from app.utils import api_response, api_error
from .csv_uploader_manager import manager_upload_artists
from .csv_uploader_s_admin import s_admin_upload_artists
from user.permissions import *

# Create your views here.
class ArtistListCreateView(APIView):
    
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def post(self,request):
        data = request.data

        try:
            serializer = ArtistSerializer(data=data)
            if not serializer.is_valid():
                return api_error(400,"Validation failed for provided details", serializer.errors)
            serializer.save()
            return api_response(201, "Artist created successfully", serializer.data)

        except Exception as e:
            print("Error creating artist", e)
            return api_error(500, "Internal server error", str(e))

    def get(self,request):
        try:
            limit = int(request.GET.get("limit", 12))
            page = int(request.GET.get("page", 1))  

            if request.user.role=='super_admin':
                artists = fetch_many_dict(path="artist/fetch_artists.sql",limit=limit, page=page)

                total = fetch_one(path="artist/fetch_artists_count.sql")

            elif request.user.role=='artist_manager':
                artists = fetch_many_dict(path="artist/fetch_artists_by_manager.sql",params={"manager_id":request.user.id},limit=limit, page=page)
                print("Artists",artists)

                total = fetch_one(path="artist/fetch_artists_count_by_manager.sql",params={"manager_id":request.user.id})
                
            return api_response(200, "Artists fetched successfully", {"total_artists":total['total_artists'],"artists":artists})
        except Exception as e:
            print("Error fetching artists", e)
            return api_error(500, "Internal server error", str(e))


class ArtistDetailView(APIView):
    permission_classes = [IsManagerOrReadOnly]

    def get_object(self, artist_id):
        # fetch from SQL
        artist = fetch_one('api/sql/artists/get_artist_by_id.sql', {'id': artist_id})
        return artist

    def get(self, request, artist_id):
        artist = self.get_object(artist_id)
        self.check_object_permissions(request, artist)  
        return api_response(200, "Artist fetched successfully", artist)
    

class ArtistCSVUploadView(APIView):
    
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def post(self, request):
        file = request.FILES.get('file')
        if not file.name.endswith('.csv'):
            return api_error(400,"Only CSV files are supported.")

        try:
            if request.user['role'] == 'artist_manager':
                uploaded_artists = manager_upload_artists(file,"8")
            elif request.user['role'] == 'super_admin':
                uploaded_artists = s_admin_upload_artists(file)
        except ValueError as e:
            return api_error(400, "CSV validation failed", str(e))

        print("afterresosnesneenenenenen")
        return api_response(201, "Artists uploaded successfully", uploaded_artists)
    
       