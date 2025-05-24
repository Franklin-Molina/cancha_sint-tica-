from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserViewSet, GroupViewSet, PermissionViewSet, GoogleLogin, AdminRegisterView, AdminManagementViewSet, UserProfileUpdateView, ChangePasswordView # Añadir UserProfileUpdateView y ChangePasswordView
from rest_framework import routers
from .models import User
from django.urls import path
from .views import CustomTokenObtainPairView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'manage-admins', AdminManagementViewSet, basename='manage-admin') # Registrar AdminManagementViewSet

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Usar la vista personalizada
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    
    # La ruta admin/register/ ya existe y usa AdminRegisterView.
    # Esta vista permite crear usuarios con is_staff=True, que podrían ser 'admin' o 'adminglobal'.
    # La lógica en el repositorio DjangoUserRepository asigna is_superuser=True si role='adminglobal'.
    path('admin/register/', AdminRegisterView.as_view(), name='admin_register'), 

    # URL para obtener y actualizar el perfil del usuario autenticado
    path('profile/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    # Ruta para cambiar la contraseña
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    path('', include(router.urls)),
]
# Las rutas para listar, suspender, reactivar y eliminar admins de cancha
# ahora están manejadas por AdminManagementViewSet y registradas en el router.
