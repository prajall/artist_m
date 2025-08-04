from rest_framework import permissions

class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        print("User authenticated", (request.user))
        return bool(request.user.is_authenticated and request.user.role != 'user')

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'super_admin'

class IsArtistManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'artist_manager'

class IsArtistOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            return request.user.role == 'artist'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            return request.user.id == obj['user_id']

class IsArtist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'artist'

class IsManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        else :
            return request.user.role == 'artist_manager' or request.user.role == 'super_admin'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else :
            obj['manager_id'] == request.user.id or request.user.role == 'super_admin'
                
class IsSelfOrSuperAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'super_admin' or request.user.id == obj['id']
    
class IsSuperAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        # return (request.user.role == 'super_admin' or request.user.role == 'artist_manager')
        return (request.user.role== 'super_admin' or request.user.role == 'artist_manager')

class IsSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.id == obj['id']

class IsSelfOrManagerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            return request.user.role == 'super_admin' or request.user.id == obj['id'] or request.user.id == obj['manager_id']
    