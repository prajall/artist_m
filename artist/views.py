from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *

# Create your views here.
class ListCreateView(APIView):

    def post(self,request):
        data = request.data
        serializer = ArtistSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        new_artist = serializer.save()
        print("New artist from serializer.save():",new_artist)
        print("SErializer datas", serializer.data, serializer.validated_data)
        return Response("ok")
    
    def get(self,request):
        artists = fetch_all_dict("artist/fetch_artists.sql")
        return Response(artists)
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