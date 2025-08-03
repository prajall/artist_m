from rest_framework import permissions

class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        print("User authenticated", (request.user))
        return bool(request.user.is_authenticated)

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'super_admin'

class IsArtistManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'artist_manager'

class IsArtist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'artist'

class IsManagerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else :
            obj['manager'] == request.user.id
                
class IsSelfOrSuperUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'super_admin' or request.user.id == obj['id']
    
class IsSuperAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        # return (request.user.role == 'super_admin' or request.user.role == 'artist_manager')
        return (request.user.role== 'super_admin' or request.user.role == 'artist_manager')