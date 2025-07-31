from rest_framework import permissions

class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user)

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user['role'] == 'super_admin'

class IsArtistManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user['role'] == 'artist_manager'

class IsArtist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user['role'] == 'artist'

class IsManagerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or (
                    request.user and obj['manager'] == request.user['id']
                )
                
class IsSelfOrSuperUser(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return request.user['role'] == 'super_admin' or request.user['id'] == obj['id']