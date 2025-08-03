from rest_framework.authentication import BaseAuthentication
import jwt
from django.conf import settings
from user.models import AuthUser

class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        print("Authenticating")
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token,settings.SECRET_KEY,"HS256" )
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            print("Invalid Token", e)
            return None
        except Exception as e:
            print("Error in Authentication",e)
            return None
        
        print("Auth User model",payload)
        user = AuthUser(payload)
        return (user, token)
           



        