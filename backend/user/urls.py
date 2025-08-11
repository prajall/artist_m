from django.urls import path
from .views import *


urlpatterns = [
    path("",UserListCreateView.as_view()),
    path("<int:user_id>/", UserDetailView.as_view()),
    path("login/",LoginView.as_view()),
    path("token/refresh/",RefreshView.as_view()),
    path("info/", UserInfo.as_view()),
    path("logout/", LogoutView.as_view()),
]
