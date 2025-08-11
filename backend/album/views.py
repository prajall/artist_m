from django.shortcuts import render
import json
from rest_framework.views import APIView
from query.sql.utils import fetch_all_dict, fetch_one,fetch_many_dict, execute_sql
from .serializers import *
from app.utils import api_response, api_error
from user.permissions import *
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from collections import defaultdict
from rest_framework import status
from rest_framework.permissions import OR
from song.serializers import SongSerializer
from django.conf import settings
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from django.db import transaction 
from rest_framework.serializers import ValidationError


# Create your views here.
class AlbumListCreateView(APIView):

    parser_classes = (JSONParser,MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = request.data.copy()
        user_id = request.user.id

        try:
            if request.user.role == 'artist':
                artist = fetch_one("artist/get_artist_by_user_id.sql", [request.user.id])
                data['artist_id'] = artist['id'] if artist else None
            else:
                artist = fetch_one("artist/get_artist_by_id.sql", {"id": data['artist_id']})
                data['artist_id'] = artist['id'] if artist else None

            serializer = AlbumSerializer(data=data, context={"user_id": request.user.id, "artist_id": artist['id']})
            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", serializer.errors)

            new_album = serializer.save()
    
            return api_response(status.HTTP_201_CREATED, "Album created successfully", {"album":new_album})

        except serializers.ValidationError as e:
            return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", e.detail)
        
        except Exception as e:
            print("Error creating album", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")

    def get(self, request):
        try:
            user_id = request.user.id
            user_role = request.user.role
            page = request.GET.get('page', 1)
            limit = request.GET.get('limit', 12)
            artist_id = request.GET.get('artist_id', None)
            manager_id = (request.GET.get("manager_id",None))
            songs=[]
            total_albums = {
                "total_count":0
            }

            
            if user_role == 'artist':
                artist = fetch_one("artist/get_artist_by_user_id.sql", [user_id])
                artist_id = artist.get("id")
                params={
                    "artist_id":artist_id, 
                    "manager_id":artist.get('manager_id',None),
                    "limit":limit, 
                    "page":page,
                }
                albums = fetch_many_dict(path="album/fetch_albums.sql",params=params)
                total_albums = fetch_one(path="album/get_album_count.sql",params=params)
                
            if user_role == 'artist_manager':
                params={
                    "artist_id":artist_id,
                    "manager_id":user_id,
                    "limit":limit, 
                    "page":page
                }
                albums = fetch_many_dict(path="album/fetch_albums.sql",params=params )
                total_albums = fetch_one(path="album/get_album_count.sql",params=params)

            if user_role == 'super_admin':
                params={
                    "artist_id":artist_id,
                    "manager_id":manager_id,
                    "limit":limit, 
                    "page":page
                }
                albums = fetch_many_dict(path="album/fetch_albums.sql", params=params)
                total_albums = fetch_one(path="album/get_album_count.sql",params=params)
            
            # albums = fetch_many_dict(path="album/fetch_albums.sql", params={"artist_id":artist_id},limit=limit, page=page)

            # total_albums = fetch_one("album/get_album_count.sql", {"artist_id":artist_id})

            return api_response(status.HTTP_200_OK, "Albums fetched successfully", {"total_albums": total_albums['total_count'],"albums": albums})

        except:
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")    
            
class AlbumDetailView(APIView):

    parser_classes = (MultiPartParser, FormParser,)
    permission_classes = [IsAuthenticated]

    def get_object(self, album_id):
        try:
            return fetch_one("album/get_album_by_id.sql", {"album_id":album_id})
        except:
            return None

    def get(self, request, album_id):
        try:
            album = self.get_object(album_id)
            if not album:
                return api_error(status.HTTP_404_NOT_FOUND,"Album not found")
            return api_response(status.HTTP_200_OK, "Album detail fetched successfully", album)
        except (PermissionDenied, NotAuthenticated) as e:
           return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error fetching album",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
    
    def patch(self, request, album_id):
        try:
            data = request.data.copy()
            if request.user.role == 'artist':
                artist = fetch_one("artist/get_artist_by_user_id.sql", [request.user.id])
                data['artist_id'] = artist['id'] if artist else None
            else:
                artist = fetch_one("artist/get_artist_by_id.sql", {"id": data['artist_id']})
                data['artist_id'] = artist['id'] if artist else None

            album = self.get_object(album_id)
            if not album:
                return api_error(status.HTTP_404_NOT_FOUND,"Album not found")

            self.check_object_permissions(request, album)

            serializer = AlbumSerializer(data=request.data, instance = album,context={"user_id": request.user.id} ,partial=True)

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", serializer.errors)
            updated_album = serializer.save()
            return api_response(status.HTTP_200_OK, "Album updated successfully", updated_album)

        except ValidationError as e:
            return api_error(status.HTTP_400_BAD_REQUEST, str(e.detail))

        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        
        except Exception as e:
            print("Error updating album",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
    
    def delete(self, request, album_id):
        try:
            album = self.get_object(album_id)
            if not album:
                return api_error(status.HTTP_404_NOT_FOUND,"Album not found")

            self.check_object_permissions(request, album)

            execute_sql("album/delete_album.sql", {"album_id":album_id})
            return api_response(status.HTTP_204_NO_CONTENT, "Album deleted successfully")
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except:
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
    
    
    
class AlbumSongView(APIView):

    permission_classes = [IsAuthenticated, IsArtistOrManager]

    def get_object(self, album_id, song_id):
        try:
            return fetch_one("album/get_album_song_exist.sql", {"album_id":album_id, "song_id":song_id})
        except:
            return None

    def post(self, request):
        try:
            serializer = AlbumSongSerializer(data=request.data)
            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details", serializer.errors)
            new_album_song = serializer.save()
            return api_response(status.HTTP_201_CREATED, "Album song created successfully", new_album_song)
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error creating album song", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")
            
    def delete(self, request):
        try:
            instance = self.get_object(request.data['album_id'], request.data['song_id'])
            if not instance:
                return api_error(status.HTTP_404_NOT_FOUND, "Album song not found")
            self.check_object_permissions(request, instance)
            
            execute_sql(
                path="album/delete_album_song.sql",
                params={"song_id": instance['song_id'], "album_id": instance['album_id']},
            )
            return api_response(status.HTTP_204_NO_CONTENT, "Album song deleted successfully")
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error deleting album song", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")

class AlbumSongsView(APIView):
    permission_classes = [IsAuthenticated, IsArtistOrManager]

    def get(self, request, album_id):
        try:
            songs = fetch_many_dict(path="album/get_album_songs.sql", params={"album_id": album_id})
            return api_response(status.HTTP_200_OK, "Album songs fetched successfully", songs)
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error fetching album songs", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")

class SongAlbumsView(APIView):
    permission_classes = [IsAuthenticated, IsArtistOrManager]

    def get(self, request, song_id):
        try:
            albums = fetch_many_dict(path="album/get_song_albums.sql", params={"song_id": song_id})
            return api_response(status.HTTP_200_OK, "Song albums fetched successfully", albums)
        except (PermissionDenied, NotAuthenticated) as e:
            return api_error(status.HTTP_403_FORBIDDEN, str(e))
        except Exception as e:
            print("Error fetching song albums", e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error")