from rest_framework.views import APIView
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *
from app.utils import api_response, api_error
from .csv_uploader_manager import manager_upload_artists
from .csv_uploader_s_admin import s_admin_upload_artists
from user.permissions import *
from rest_framework import status
from rest_framework.permissions import OR
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from django.db import transaction


# Create your views here.
class ArtistListCreateView(APIView):
    
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def post(self,request):
        data = request.data.copy()
        
        if request.user.role=="artist_manager":
            data['manager'] = request.user.id

        try:
            serializer = ArtistSerializer(data=data, context={"user": request.user})
            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST,"Validation failed for provided details", serializer.errors)
            serializer.save()
            return api_response(status.HTTP_201_CREATED, "Artist created successfully", serializer.data)

        except Exception as e:
            print("Error creating artist", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")

    def get(self,request):
        try:
            limit = int(request.GET.get("limit", 12))
            page = int(request.GET.get("page", 1)) 
            manager_id = request.GET.get("manager_id", None)

            if request.user.role=='artist_manager':
                manager_id = request.user.id

            artists = fetch_many_dict(path="artist/fetch_artists.sql",params={"manager_id":manager_id},limit=limit, page=page)
            total = fetch_one(path="artist/fetch_artists_count.sql",params={"manager_id":manager_id})
                
            return api_response(status.HTTP_200_OK, "Artists fetched successfully", {"total_artists":total['total_artists'],"artists":artists})
        except Exception as e:
            print("Error fetching artists", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")


class ArtistDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSelfOrManagerOrReadOnly]

    def get_object(self, artist_id):
        artist = fetch_one('artist/get_artist_by_id.sql', {'id': artist_id})
        return artist

    def get(self, request, artist_id):
        try:
            artist = self.get_object(artist_id)
            if not artist:
                return api_error(status.HTTP_404_NOT_FOUND,"Artist not found")
            self.check_object_permissions(request, artist)  
            return api_response(status.HTTP_200_OK, "Artist detail fetched successfully", artist)
        except (PermissionDenied, NotAuthenticated) as e:
           return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error fetching artist",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
    
    def patch(self, request, artist_id):
        data = request.data.copy()
        try:
            artist = self.get_object(artist_id)
            if not artist:
                return api_error(status.HTTP_404_NOT_FOUND,"Artist not found")
            
            print("Artist",artist)
            self.check_object_permissions(request, artist)

            serializer = ArtistSerializer( data=data , instance=artist, context={"user":request.user} , partial=True)

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details",serializer.errors)
            serializer.save()
            return api_response(status.HTTP_200_OK,"Artist detail updated successfully",serializer.data)

        except (PermissionDenied, NotAuthenticated) as e:
           return api_error(status.HTTP_403_FORBIDDEN, str(e))
 
        except Exception as e:
            print("Error updating artist",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
        
    def delete(self, request, artist_id):
        try:
            with transaction.atomic():
                artist = self.get_object(artist_id)
                if not artist:
                    return api_error(status.HTTP_404_NOT_FOUND,"Artist not found")
                self.check_object_permissions(request,artist)
                execute_sql("artist/delete_artist.sql", {"artist_id":artist_id})
                execute_sql("artist/set_role_to_user.sql",[artist['user_id']])
                return api_response(status.HTTP_204_NO_CONTENT, "Artist deleted successfully")
        except (PermissionDenied, NotAuthenticated) as e:
           return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error deleting artist",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")

class ArtistCSVUploadView(APIView):
    
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def post(self, request):
        file = request.FILES.get('file')
        if not file.name.endswith('.csv'):
            return api_error(status.HTTP_400_BAD_REQUEST,"Only CSV files are supported.")

        try:
            with transaction.atomic():
                if request.user.role == 'artist_manager':
                    manager_id = request.user.id
                    uploaded_artists = manager_upload_artists(file,manager_id)
                    return api_response(status.HTTP_201_CREATED, "Artists uploaded successfully", uploaded_artists)
                elif request.user.role == 'super_admin':
                    uploaded_artists = s_admin_upload_artists(file)
                    return api_response(status.HTTP_201_CREATED, "Artists uploaded successfully", uploaded_artists)
                else:
                    return api_error(status.HTTP_403_FORBIDDEN, "You are not authorized to upload artists.")
        except ValueError as e:
            return api_error(status.HTTP_400_BAD_REQUEST, "CSV validation failed", str(e))

        except Exception as e:
            print("Error uploading artists", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")
       
class ArtistExportView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request):
        artists = fetch_all_dict("artist/fetch_artists.sql", {"manager_id": request.user.id})
        return api_response(status.HTTP_200_OK, "Artists fetched successfully", artists)