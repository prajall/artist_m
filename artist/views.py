from rest_framework.views import APIView
from rest_framework.response import Response
from user.permissions import IsManagerOrReadOnly
from app.utils import api_response, api_error
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from .serializers import *
from .csv_uploader import upload_artists
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

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
        self.check_object_permissions(request, artist)  
        return Response(artist)
    

class ArtistCSVUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file.name.endswith('.csv'):
            return Response({"error": "Only CSV files are supported."}, status=400)

        try:
            uploaded_artists = upload_artists(file,"8")
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        print("afterresosnesneenenenenen")
        return Response(f"ok {uploaded_artists}")
    
        for row in reader:
            line_num += 1
            user_id = row.get("user_id")
            artist_name = row.get("artist_name")
            first_release_year = row.get("first_release_year")
            manager_id = row.get("manager_id") or None
            albums = row.get("no_of_albums_released") or 0

            if not self.user_exists(user_id):
                errors.append(f"Line {line_num}: User ID {user_id} does not exist.")
                continue

            if not artist_name:
                errors.append(f"Line {line_num}: Artist name is required.")
                continue

            if manager_id and not self.user_exists(manager_id):
                errors.append(f"Line {line_num}: Manager ID {manager_id} does not exist.")
                continue

            try:
                release_date = first_release_year or None
                albums = int(albums)
            except ValueError:
                errors.append(f"Line {line_num}: Invalid number of albums or release year format.")
                continue

            artist_rows.append((
                user_id,
                artist_name,
                release_date,
                manager_id,
                albums
            ))

        if errors:
            return Response({"status": "error", "errors": errors}, status=400)

        self.bulk_insert_artists(artist_rows)
        return Response({"message": "Artists uploaded successfully."}, status=201)

    def user_exists(self, email):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users WHERE email = %s", [email])
            return cursor.fetchone() is not None

    def bulk_insert_artists(self, rows):
        with connection.cursor() as cursor:
            args_str = ",".join(cursor.mogrify("(%s,%s,%s,%s,%s)", row).decode() for row in rows)
            query = f"""
            INSERT INTO artists (user_id, artist_name, first_release_year, manager_id, no_of_albums_released)
            VALUES {args_str}
            """
            cursor.execute(query)
