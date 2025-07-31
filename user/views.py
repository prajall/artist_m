from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer, LoginSerializer, RefreshSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from user.permissions import IsManagerOrReadOnly, IsArtistManager, IsSuperAdmin
from query.sql.utils import fetch_all_dict, fetch_one, execute_sql
from app.utils import api_response, api_error

# Create your views here.
class UserListCreateView(APIView):

    # permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def post(self, request):
        data = request.data
        try:
            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return api_response(201, "User created successfully", serializer.data)
            else:
                print("errors", serializer.errors)
                return api_error(400, "Validation failed for provided details",serializer.errors)
        except Exception as e:
            print("Error creating user",e)
            return api_error(500, "Internal Server Error")

    def get(self, request):
        print("Authenticated user",request.user)
        users = fetch_all_dict("user/fetch_users.sql",[])
        return api_response(200, "User fetched successfully", users)

class LoginView(APIView):

    def post(self,request):
        data = request.data
        serializer = LoginSerializer(data = data)
        serializer.is_valid()

        print("Serializer data", serializer.validated_data)
        user = serializer.validated_data['user']
        access= serializer.validated_data['access_token']
        refresh= serializer.validated_data['refresh_token']
        final_res = {
            "user":user,
            "access":access,
            "refresh":refresh
        }

        return api_response(200, "Login Successfull",final_res )
       
class RefreshView(APIView):

    def post (self,request):
        data = request.data
        serializer = RefreshSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        final_res = {"access":serializer.validated_data['access']}
        return api_response(200, "Accss token refreshed successfully",final_res)

class UserDetailView(APIView):
    
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
            return api_error(404,"User not found")
        return api_response(200, "User detail fetched successfully", user)

    def patch(self, request, user_id):
        data = request.data
        print("request data", request.data)
        try:
            user = self.get_user(user_id)
            print("User", user)
        except Exception as e:
            print("Error fetching user",e)
            return api_error(500,"Internal Server Error")
            # return Response("Failed to update user")
        
        
        serializer = UserSerializer( data=data , instance=user , partial=True)

        if not serializer.is_valid():
            return api_error(400, "Validation failed for user details",serializer.error_messages)
        serializer.save()
        return api_response(200,"User detail updated successfully",serializer.data)

    def delete(self, request, user_id):
        try:
            delete_user = execute_sql(path="user/delete_user.sql",params=[user_id])
            print("delete_user",delete_user)
        except Exception as e:
            print("Error Deleting user",e)
        if delete_user == 1:    
            return api_response(204, "User deleted successfully")
        if delete_user==0:
            return api_response(204, "User already deleted")