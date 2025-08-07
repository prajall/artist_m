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
from rest_framework.permissions import OR
import os

# Create your views here.
class UserListCreateView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def post(self, request):
        data = request.data.copy()
        try:

            serializer = UserSerializer(data=data)

            if not serializer.is_valid():
                return api_error(status.HTTP_400_BAD_REQUEST, "Validation failed for provided details",serializer.errors)
            validated_data = serializer.validated_data
            if validated_data.get("profile_image"):
                image = validated_data['profile_image']
                fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'user_profile'))
                filename = fs.save(image.name, image)
                profile_image_url = settings.MEDIA_URL + 'user_profile/' + filename
                validated_data['profile_image'] = profile_image_url

            user = serializer.save()
            del user['password'] 
            return api_response(status.HTTP_201_CREATED, "User created successfully", user)
            
        except Exception as e:
            print("Error creating user",e)
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")
            
    def get(self, request):
        print("Authenticated user",request.user)
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        users = fetch_many_dict(path="user/fetch_users.sql", limit=limit, page=page)
        total_users = fetch_one("user/user_count.sql")

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
        print("request data", request.data)
        print("User_id",user_id)
        try:
            if 'profile_image' in request.FILES:
                image = request.FILES['profile_image']
                fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'user_profile'))
                filename = fs.save(image.name, image)
                profile_image_url = settings.MEDIA_URL + 'user_profile/' + filename
                data['profile_image'] = profile_image_url

            user = self.get_user(user_id)
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
            
class LoginView(APIView):

    def post(self,request):
        data = request.data
        serializer = LoginSerializer(data = data)
        serializer.is_valid(raise_exception=True)

        print("Serializer data", serializer.validated_data)
        user = serializer.validated_data['user']
        access= serializer.validated_data['access_token']
        refresh= serializer.validated_data['refresh_token']
        
        
        # return api_response(status.HTTP_200_OK,"Login Successfull",{"user":user,"access_token":access,"refresh_token":refresh})
        
        response = Response({"message":"Login Successfull","data":user},status=status.HTTP_200_OK)
        response.set_cookie(
            key='access_token',
            value= access,
            httponly=True,
            secure=True,
            samesite=None,
            max_age=settings.ACCESS_TOKEN_LIFETIME
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

    def post (self,request):
        data = request.data
        serializer = RefreshSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data['access']
        
        Response.set_cookie(
            key='access_token',
            value= access,
            httponly=True,
            secure=True,
            samesite=None,
            max_age=settings.ACCESS_TOKEN_LIFETIME
        )
        
        return Response({"message":"Accss token refreshed successfully"},status=status.HTTP_200_OK)
    
    
class UserInfo(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return api_response(status.HTTP_200_OK, "User info fetched successfully", request.user)