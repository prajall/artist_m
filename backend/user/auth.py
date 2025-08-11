from rest_framework.authentication import BaseAuthentication
import jwt
from django.conf import settings
from user.models import AuthUser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import APIException
from rest_framework import status

class TokenExpiredException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Access token has expired'
    default_code = 'token_expired'

class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        token = request.COOKIES.get("access_token")

        if not token:
            print("No access_token in cookies")
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            print("Token expired")
            raise TokenExpiredException("Access token has expired")  
        except jwt.InvalidTokenError as e:
            print("Invalid Token", e)
            raise AuthenticationFailed("Invalid access token")  
        except Exception as e:
            print("Error in Authentication", e)
            raise AuthenticationFailed("Error processing access token")  

        user = AuthUser(payload)
        return (user, token)
           



        
    # def authenticate(self, request):
    #     print("Authenticating")
    #     auth_header = request.headers.get("Authorization")

    #     if not auth_header or not auth_header.startswith("Bearer "):
    #         return None

    #     token = auth_header.split(" ")[1]

    #     try:
    #         payload = jwt.decode(token,settings.SECRET_KEY,"HS256" )
    #     except jwt.ExpiredSignatureError:
    #         print("Token expired")
    #         return None
    #     except jwt.InvalidTokenError as e:
    #         print("Invalid Token", e)
    #         return None
    #     except Exception as e:
    #         print("Error in Authentication",e)
    #         return None
        
    #     print("Auth User model",payload)
    #     user = AuthUser(payload)
    #     return (user, token)