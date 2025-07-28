from rest_framework.authentication import BaseAuthentication
import jwt
from django.conf import settings

class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        print("Authenticating")
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token,settings.SECRET_KEY,"HS256" )
        except Exception as e:
            print("Error in Authentication",e)
            return None
        
        return (payload, token)
           



        