from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os
from rest_framework.response import Response
from rest_framework import serializers


def api_response(status,message,data=None):
    return Response({
        "message":message,
        "data":data 
    }, status=status)

def api_error(status,message,error=None):
    return Response({
        "message":message,
        "detail":error 
    }, status=status)

def save_image_file(file, field_name):
    try:
        if not file:
            return None
        
        if file.size > 5*1024*1024:
            raise serializers.ValidationError({field_name:"Image size must be less than or equal to 5MB."})

        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = file.name.split('.')[-1].lower()

        if ext not in allowed_extensions:
            raise serializers.ValidationError({field_name:"File type must be jpg, jpeg, png, or webp."})

        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, field_name))
        filename = fs.save(file.name, file)
        url = settings.MEDIA_URL + field_name + '/' + filename
        return url

    except serializers.ValidationError:
        raise  
    
    except Exception as e:
        print("Error saving song cover file:", e)
        raise serializers.ValidationError("Failed to save song cover file. Please try again.")