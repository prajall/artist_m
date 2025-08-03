from django.urls import path
from .views import *

urlpatterns = [
    path("",SongListCreateView.as_view()),
    # path("upload-csv/",SongCSVUploadView.as_view()),
]
