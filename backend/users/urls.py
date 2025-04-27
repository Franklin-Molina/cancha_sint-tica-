from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserViewSet, GroupViewSet, PermissionViewSet, GoogleLogin, AdminRegisterView
from rest_framework import routers
from .models import User
from django.urls import path
from .views import CustomTokenObtainPairView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'permissions', PermissionViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Restaurar vista personalizada
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('admin/register/', AdminRegisterView.as_view(), name='admin_register'), # Nueva URL para el registro de administradores
    path('', include(router.urls)),
   
]
