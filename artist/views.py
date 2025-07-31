from rest_framework.views import APIView
from rest_framework.response import Response
from user.permissions import IsManagerOrReadOnly
from app.utils import api_response, api_error
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *

# Create your views here.
class ArtistListCreateView(APIView):

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

    # def get(self,request):
    #     artists = fetch_all_dict("artist/fetch_artists.sql")
    #     return Response(artists)
        # serializer = ArtistListSerializer(artists,many=True)
        # # serializer.is_valid(raise_exception=True)
        # print("Artists from serializer:", serializer.
        # .
        #1 data)


class ArtistDetailView(APIView):
    permission_classes = [IsManagerOrReadOnly]

    def get_object(self, artist_id):
        # fetch from SQL
        artist = fetch_one('api/sql/artists/get_artist_by_id.sql', {'id': artist_id})
        return artist

    def get(self, request, artist_id):
        artist = self.get_object(artist_id)
        self.check_object_permissions(request, artist)  # <== ✅ pass dict as obj
        return Response(artist)