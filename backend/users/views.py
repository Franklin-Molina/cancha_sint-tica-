from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, PerfilSocialSerializer, AdminRegisterSerializer
from django.contrib.auth.models import Group, Permission
from rest_framework.permissions import IsAdminUser, IsAuthenticated # Importar IsAuthenticated
from rest_framework.decorators import action # Importar action
from .services import crear_grupo_administradores
from django.dispatch import receiver
from django.db.models.signals import post_migrate
from django.apps import AppConfig
from .models import User, PerfilSocial
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers_jwt import CustomTokenObtainPairSerializer

class UsersConfig(AppConfig):
    name = 'users'
    def ready(self):
        import users.signals  # Importa el módulo de señales

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Permisos para las acciones por defecto (list, retrieve, create, update, destroy)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Obtiene la información del usuario autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == "Administradores":
            return Response({"detail": "No se puede eliminar el grupo Administradores."}, status=400)
        return super().destroy(request, *args, **kwargs)

class PermissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows permissions to be viewed or edited.
    """
    queryset = Permission.objects.all()
    permission_classes = [IsAdminUser]

@receiver(post_migrate)
def create_groups_and_permissions(sender, **kwargs):
    if sender.name == 'users':
        crear_grupo_administradores()

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

class GoogleLogin(SocialLoginView): # subclass the SocialLoginView
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    permission_classes = [permissions.AllowAny]
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    http_method_names = ['post'] # Permitir explícitamente solo el método POST

from django.http import JsonResponse # Importar JsonResponse

class AdminRegisterView(generics.GenericAPIView):
    serializer_class = AdminRegisterSerializer
    permission_classes = [permissions.IsAdminUser]  # Solo los administradores pueden registrar otros administradores

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

def get_csrf_token(request):
    """
    Vista simple para obtener la cookie CSRF.
    El middleware de CSRF se encargará de establecer la cookie.
    """
    return JsonResponse({'detail': 'CSRF cookie set'})
