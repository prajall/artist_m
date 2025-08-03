from django.db import models

# Create your models here.
class AuthUser:
    def __init__(self, payload):
        self.id = payload.get('id')
        self.email = payload.get('email')
        self.first_name = payload.get('first_name')
        self.last_name = payload.get('last_name')
        self.role = payload.get('role')
        self.exp = payload.get('exp')

    @property
    def is_authenticated(self):
        return True