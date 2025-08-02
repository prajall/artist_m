from django.urls import path
from .views import *


urlpatterns = [
    path("",ArtistListCreateView.as_view()),
    path("upload-csv/",ArtistCSVUploadView.as_view()),
]
