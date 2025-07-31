from rest_framework.response import Response

def api_response(status,message,data=None):
    return Response({
        "success" :True,
        "message":message,
        "data":data 
    }, status=status)

def api_error(status,message,error=None):
    return Response({
        "success" :False,
        "message":message,
        "error":error 
    }, status=status)

