from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, LoginSerializer, RefreshSerializer
from rest_framework.response import Response
from user.permissions import *
from query.sql.utils import fetch_all_dict,fetch_many_dict, fetch_one, execute_sql
from app.utils import api_response, api_error
from django.core.files.storage import FileSystemStorage
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from rest_framework import status
import os
from django.db import transaction
from artist.serializers import ArtistSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

# Create your views here.
class UserListCreateView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated, IsSuperAdminOrReadOnlyManager]
    
    def post(self, request):
        data = request.data.copy()

        print("Data", data)
        with transaction.atomic():
            serializer = UserSerializer(data=data)

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details",serializer.errors)

            user = serializer.save()
            print("\n\n\nUser", user)
            if data.get('artist_name'):
                data['user_id'] = user['id']
                artist_serializer = ArtistSerializer(data=data, context={"user": request.user, "bypass_role_check":True})
                if not artist_serializer.is_valid():
                    return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details",artist_serializer.errors)
                artist_serializer.save()
                
            del user['password'] 
            return api_response(status.HTTP_201_CREATED, "User created successfully", user)
        # try:
            
        # except Exception as e:
        #     print("Error creating user",e)
        #     return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")
            
    def get(self, request):
        print("Authenticated user",request.user)
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        search = request.GET.get("search",None)
        role = request.GET.get("role",None)

        if not role in ["super_admin", "artist_manager", "artist","user"]:
            role=None
        
        if request.user.role == 'artist_manager':
            role = 'user'
        
        params = {
            'search': search,
            'search_pattern': f"%{search}%" if search and search.strip() else None,
            'role': role,
            'limit': limit,
            'offset': (page - 1) * limit
        }
        users = fetch_many_dict(path="user/fetch_users.sql",params=params, limit=limit, page=page)
        total_users = fetch_one("user/user_count.sql",params)

        return api_response(status.HTTP_200_OK, "User fetched successfully", {"total_users": total_users['count'],"users": users})


class UserDetailView(APIView):

    permission_classes = [IsAuthenticated, IsSelfOrSuperAdmin]    
    def get_user(self, user_id):
        try:
            user = fetch_one("user/fetch_user_detail.sql", [user_id])
            return user
        except Exception as e:
            print("Error fetching user:", e)
            return None

    def get(self, request, user_id):
        user = self.get_user(user_id)
        self.check_object_permissions(request,user)
        if not user:
            return api_error(status.HTTP_404_NOT_FOUND,"User not found")
        return api_response(status.HTTP_200_OK, "User detail fetched successfully", user)

    def patch(self, request, user_id):
        data = request.data.copy()
        print("\n\n\n\nrequest data", request.data)
        print("User_id",user_id)
        try:
            user = self.get_user(user_id)
            self.check_object_permissions(request,user)
            print("User", user)
            serializer = UserSerializer( data=data , instance=user , partial=True)

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for user details",serializer.errors)
            serializer.save()
            return api_response(status.HTTP_200_OK,"User detail updated successfully",serializer.data)
        except Exception as e:
            print("Error fetching user",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR,"Internal Server Error")
            # return Response("Failed to update user")
        
        

    def delete(self, request, user_id):
        try:
            delete_user = execute_sql(path="user/delete_user.sql",params=[user_id])
            print("delete_user",delete_user)
        except Exception as e:
            print("Error Deleting user",e)
        if delete_user == 1:    
            return api_response(status.HTTP_204_NO_CONTENT, "User deleted successfully")
        if delete_user==0:
            return api_response(status.HTTP_204_NO_CONTENT, "User already deleted")

@method_decorator(csrf_exempt, name='dispatch')    
class LoginView(APIView):
    authentication_classes = []

    def post(self,request):
        data = request.data
        serializer = LoginSerializer(data = data)
        serializer.is_valid(raise_exception=True)

        print("Serializer data", serializer.validated_data)
        user = serializer.validated_data['user']
        access= serializer.validated_data['access_token']
        refresh= serializer.validated_data['refresh_token']
        
        
        response = Response({"message":"Login Successfull","data":user},status=status.HTTP_200_OK)
        response.set_cookie(
            key='access_token',
            value= access,
            httponly=True,
            secure=True,
            samesite=None,
        )
        
        response.set_cookie(
            key='refresh_token',
            value= refresh,
            httponly=True,
            secure=True,
            samesite=None,
            max_age=settings.REFRESH_TOKEN_LIFETIME
        )
        return response
       
class RefreshView(APIView):
    authentication_classes = []
    def post(self, request):
        data = {}
        data["refresh"] = request.COOKIES.get("refresh_token") # interceptor sends in cookies
        if not data["refresh"]:
            data = request.data  # middleware sends in data
        print("\n\nCookies Data", data["refresh"])
        serializer = RefreshSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data['access']

        res =  Response(
            {"message": "Access token refreshed successfully", "access_token": access},
            status=status.HTTP_200_OK,
        )
        res.set_cookie(
            key='access_token',
            value= access,
            httponly=True,
            secure=True,
            samesite=None,
        )
        return res

          
class UserInfo(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user =  {
                "id": request.user.id,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "role": request.user.role,
            }
        return api_response(status.HTTP_200_OK, "User info fetched successfully", user)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        print("Refresh token", refresh_token)
        if not refresh_token:
            return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")
            return response
        except TokenError:
            return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


