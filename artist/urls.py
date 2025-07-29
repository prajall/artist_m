from django.urls import path
from .views import *


urlpatterns = [
    path("",ListCreateView.as_view()),
]
