from rest_framework import permissions, viewsets, status, views # Añadir status y views
from rest_framework.response import Response
from asgiref.sync import async_to_sync # Importar async_to_sync
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

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_user_repository import DjangoUserRepository
from .application.use_cases.register_user import RegisterUserUseCase
from .application.use_cases.get_user_profile import GetUserProfileUseCase
from .application.use_cases.update_user_profile import UpdateUserProfileUseCase
# Nota: Los casos de uso para login/logout/google se manejan en el frontend
# y los endpoints de JWT/dj-rest-auth manejan la autenticación en el backend.

class UsersConfig(AppConfig):
    name = 'users'
    def ready(self):
        import users.signals  # Importa el módulo de señales

class RegisterView(views.APIView): # Cambiar a APIView
    permission_classes = [permissions.AllowAny]

    def post(self, request): # Cambiar a método síncrono
        user_repository = DjangoUserRepository()
        register_user_use_case = RegisterUserUseCase(user_repository)
        
        # Usar RegisterSerializer solo para validación
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Pasar los datos validados al caso de uso
            # El caso de uso y el repositorio se encargarán de la creación y el hasheo de la contraseña.
            user_data_for_creation = serializer.validated_data.copy() # Crear una copia para modificar
            # El repositorio espera 'password', no 'password' y 'password2' por separado después de la validación.
            # El serializador ya valida que password y password2 coincidan.
            # El repositorio se encargará de hashear 'password'.
            user_data_for_creation.pop('password2', None)

            try:
                # Envolver la llamada asíncrona con async_to_sync
                user = async_to_sync(register_user_use_case.execute)(user_data_for_creation)
                # Devolver los datos del usuario creado usando UserSerializer para la respuesta
                response_serializer = UserSerializer(user) 
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e: # Capturar errores de validación del caso de uso (ej. usuario ya existe)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e: # Otras excepciones
                # Loguear el error completo para depuración
                print(f"Error interno no capturado en RegisterView: {e}")
                import traceback
                traceback.print_exc()
                return Response({"error": "Error interno del servidor al registrar el usuario."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet): # Mantener ModelViewSet por ahora, refactorizar métodos individuales
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Permisos para las acciones por defecto (list, retrieve, create, update, destroy)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request): # Cambiar a método síncrono
        """
        Obtiene la información del usuario autenticado.
        Usa GetUserProfileUseCase.
        """
        user_repository = DjangoUserRepository()
        get_user_profile_use_case = GetUserProfileUseCase(user_repository)
        
        # request.user.id es el ID del usuario autenticado
        # Envolver la llamada asíncrona con async_to_sync
        user_profile = async_to_sync(get_user_profile_use_case.execute)(user_id=request.user.id)
        if user_profile:
            serializer = UserSerializer(user_profile) # Usar UserSerializer
            return Response(serializer.data)
        return Response({"error": "Perfil de usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    # TODO: Refactorizar otros métodos de UserViewSet (list, retrieve, create, update, destroy)
    # para usar casos de uso si es necesario, especialmente si tienen lógica de negocio compleja.
    # Por ahora, se dejan como están para mantener la funcionalidad de admin.

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

class AdminRegisterView(views.APIView): # Cambiar a APIView
    permission_classes = [permissions.IsAdminUser]  # Solo los administradores pueden registrar otros administradores

    def post(self, request): # Cambiar a método síncrono
        user_repository = DjangoUserRepository()
        # Podríamos crear un RegisterAdminUseCase o reutilizar RegisterUserUseCase
        # si la lógica es similar y el serializador maneja las diferencias.
        register_user_use_case = RegisterUserUseCase(user_repository) 
        
        serializer = AdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            # Asegurarse de que el usuario creado sea staff
            user_data['is_staff'] = True 
            try:
                # Envolver la llamada asíncrona con async_to_sync
                user = async_to_sync(register_user_use_case.execute)(user_data)
                response_serializer = UserSerializer(user) # Usar UserSerializer para la respuesta
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": "Error interno del servidor al registrar el administrador."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_csrf_token(request):
    """
    Vista simple para obtener la cookie CSRF.
    El middleware de CSRF se encargará de establecer la cookie.
    """
    return JsonResponse({'detail': 'CSRF cookie set'})
