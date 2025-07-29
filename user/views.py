from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer, LoginSerializer, RefreshSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from query.sql.utils import fetch_all_dict

# Create your views here.
class UserListCreateView(APIView):

    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = request.data
        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response("Success")

    def get(self, request):
        print("Authenticated user",request.user)
        users = fetch_all_dict("user/fetch_users.sql",[])
        print("Fetched users:",users)
        print(user for user in users)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class LoginView(APIView):

    def post(self,request):
        data = request.data
        serializer = LoginSerializer(data = data)
        serializer.is_valid()

        print("Serializer data", serializer.validated_data)
        user = serializer.validated_data['user']
        access= serializer.validated_data['access_token']
        refresh= serializer.validated_data['refresh_token']

        return Response({
            "user":user,
            "access":access,
            "refresh":refresh
        })
       
class RefreshView(APIView):

    def post (self,request):
        data = request.data
        serializer = RefreshSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response({"access":serializer.validated_data['access']})
