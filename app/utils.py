from rest_framework.response import Response

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

