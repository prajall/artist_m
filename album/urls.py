from django.urls import path
from .views import *


urlpatterns = [
    path("",AlbumListCreateView.as_view()),
    path("<int:album_id>/",AlbumDetailView.as_view()),
]
