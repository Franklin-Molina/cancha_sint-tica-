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
import logging # Importar el módulo logging
from .models import User, PerfilSocial
import time # Importar el módulo time
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # Asegurarse que TokenObtainPairSerializer está importado
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken # Importar excepciones necesarias
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
# from rest_framework_simplejwt.views import TokenObtainPairView # Duplicado, ya importado arriba
from rest_framework_simplejwt.serializers import TokenRefreshSerializer # TokenObtainPairSerializer ya importado
from .serializers_jwt import CustomTokenObtainPairSerializer

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_user_repository import DjangoUserRepository
from .application.use_cases.register_user import RegisterUserUseCase
from .application.use_cases.get_user_profile import GetUserProfileUseCase
from .application.use_cases.update_user_profile import UpdateUserProfileUseCase
from .application.use_cases.get_user_list import GetUserListUseCase # Nuevo
from .application.use_cases.update_user_status import UpdateUserStatusUseCase # Nuevo
from .application.use_cases.delete_user import DeleteUserUseCase # Nuevo
from .application.use_cases.change_password import ChangePasswordUseCase # Importar caso de uso de cambio de contraseña
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
    def list(self, request, *args, **kwargs):
        """
        Lista usuarios, aplicando filtros de query params si existen.
        Usa GetUserListUseCase.
        """
        user_repository = DjangoUserRepository()
        get_user_list_use_case = GetUserListUseCase(user_repository)

        # Obtener filtros de los parámetros de consulta
        filters = request.query_params.dict()

        # Aplicar filtro basado en el rol del usuario autenticado
        # Si el usuario es 'adminglobal', solo listar usuarios con rol 'admin'
        if hasattr(request.user, 'role') and request.user.role == 'adminglobal':
            filters['role'] = 'admin'
        # Si el usuario es 'admin', listar todos los usuarios (comportamiento por defecto sin filtro de rol)

        # Envolver la llamada asíncrona con async_to_sync
        users = async_to_sync(get_user_list_use_case.execute)(filters=filters)

        # Serializar la lista de usuarios
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def activate(self, request, pk=None):
        """
        Activa un usuario con rol 'cliente'. Solo accesible para usuarios con rol 'admin'.
        """
        user_repository = DjangoUserRepository()
        update_user_status_use_case = UpdateUserStatusUseCase(user_repository)

        # Verificar que el usuario solicitante sea 'admin'
        if not (hasattr(request.user, 'role') and request.user.role == 'admin'):
             return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)

        # Verificar que el usuario a modificar tenga el rol 'cliente'
        try:
            user_to_modify = User.objects.get(pk=pk)
            if user_to_modify.role != 'cliente':
                 return Response({"detail": "Solo puedes activar usuarios con el rol 'cliente'."}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        user = async_to_sync(update_user_status_use_case.execute)(user_id=pk, is_active=True)
        if user:
            return Response({"detail": f"Usuario {user.username} activado."}, status=status.HTTP_200_OK)
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def deactivate(self, request, pk=None):
        """
        Desactiva un usuario con rol 'cliente'. Solo accesible para usuarios con rol 'admin'.
        """
        user_repository = DjangoUserRepository()
        update_user_status_use_case = UpdateUserStatusUseCase(user_repository)

        # Verificar que el usuario solicitante sea 'admin'
        if not (hasattr(request.user, 'role') and request.user.role == 'admin'):
             return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)

        # Verificar que el usuario a modificar tenga el rol 'cliente'
        try:
            user_to_modify = User.objects.get(pk=pk)
            if user_to_modify.role != 'cliente':
                 return Response({"detail": "Solo puedes desactivar usuarios con el rol 'cliente'."}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        user = async_to_sync(update_user_status_use_case.execute)(user_id=pk, is_active=False)
        if user:
            return Response({"detail": f"Usuario {user.username} desactivado."}, status=status.HTTP_200_OK)
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)


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

from .services import crear_grupo_administradores, crear_grupo_clientes, crear_grupo_gestores_cancha # Importar todas

@receiver(post_migrate)
def create_groups_and_permissions(sender, **kwargs):
    if sender.name == 'users': # Asegurarse de que se ejecute solo para la app 'users'
        print("Ejecutando create_groups_and_permissions para la app 'users'...")
        crear_grupo_administradores()
        crear_grupo_clientes()
        crear_grupo_gestores_cancha()
        print("Grupos creados/actualizados.")

class LoginView(views.APIView): # Cambiado de TokenObtainPairView a views.APIView
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer # Usamos tu serializador personalizado
    logger = logging.getLogger('users')

    def post(self, request, *args, **kwargs):
        # self.logger.debug("LoginView: Inicio del proceso de login") # Log comentado
        process_start_time = time.time()

        # Instanciar el serializador con los datos de la solicitud
        serializer = self.serializer_class(data=request.data, context={'request': request})

        validation_start_time = time.time()
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            self.logger.warning(f"LoginView: TokenError durante la validación: {str(e)}")
            # Re-lanzar como InvalidToken para que DRF lo maneje correctamente y devuelva un 401
            raise InvalidToken(e.args[0])
        except Exception as e:
            self.logger.error(f"LoginView: Excepción no esperada durante serializer.is_valid: {str(e)}", exc_info=True)
            # Devolver una respuesta de error genérica si no es un error de token conocido
            return Response({"detail": "Se produjo un error durante la validación."}, status=status.HTTP_400_BAD_REQUEST)
        
        validation_time = time.time()
        # self.logger.debug(f"LoginView: Tiempo de validación del serializador (autenticación y generación de token): {validation_time - validation_start_time:.4f} segundos") # Log comentado

        # El serializador CustomTokenObtainPairSerializer (o su base) debería establecer 'user'
        # en sí mismo después de una validación exitosa si está personalizado para ello,
        # o los datos validados contendrán los tokens.
        # El objeto 'user' se obtiene del serializador si este lo expone.
        # Si CustomTokenObtainPairSerializer no expone 'user', necesitaremos obtenerlo de request.data['username']
        # y luego buscarlo, pero esto es menos ideal después de que el serializador ya lo validó.
        # La práctica común es que el serializador TokenObtainPairSerializer establece self.user
        # internamente y lo usa para generar el token.
        # Para obtener el usuario, si el serializador no lo expone directamente,
        # podemos tomar el username del request.data y buscar el usuario.
        # Sin embargo, el serializador validado ya debería tener el usuario.
        # TokenObtainPairSerializer en su método validate() establece self.user.
        # Si CustomTokenObtainPairSerializer llama a super().validate(), entonces self.user estará disponible.

        user = getattr(serializer, 'user', None) # Intentar obtener el usuario del serializador

        if not user:
            # Fallback si serializer.user no está disponible directamente.
            # Esto no debería suceder si CustomTokenObtainPairSerializer hereda correctamente de TokenObtainPairSerializer
            # y llama a super().validate().
            self.logger.warning("LoginView: serializer.user no encontrado directamente. Esto puede indicar un problema en CustomTokenObtainPairSerializer.")
            # Si no hay usuario, la validación del token ya falló o el serializador no lo expone.
            # La respuesta de error ya se habrá lanzado desde is_valid(raise_exception=True)
            # o se habrá devuelto una respuesta de error genérica.
            # Este bloque es más una salvaguarda o para logging.
            # No deberíamos llegar aquí si la validación falló y raise_exception=True.
            # Si la validación fue exitosa pero 'user' no está, es un problema del serializador.
            # Por ahora, si llegamos aquí, es un estado inesperado.
            return Response({"detail": "Error al obtener el usuario después de la validación del token."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Serializar el objeto de usuario para incluirlo en la respuesta
        user_serialization_start_time = time.time()
        user_serializer_instance = UserSerializer(user) # UserSerializer ya está importado
        user_data = user_serializer_instance.data
        user_serialization_time = time.time()
        # self.logger.debug(f"LoginView: Tiempo de serialización del usuario: {user_serialization_time - user_serialization_start_time:.4f} segundos") # Log comentado

        # Combinar los datos del token con los datos del usuario
        response_data = serializer.validated_data.copy()
        response_data['user'] = user_data

        process_end_time = time.time()
        # self.logger.debug(f"LoginView: Tiempo total del proceso de login (exitoso): {process_end_time - process_start_time:.4f} segundos") # Log comentado
        # self.logger.debug(f"LoginView: Respuesta del login enviada al frontend: {response_data}") # Log comentado

        return Response(response_data, status=status.HTTP_200_OK)

class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

class GoogleLogin(SocialLoginView): # subclass the SocialLoginView
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    permission_classes = [permissions.AllowAny]

    def get_response(self):
        # Obtener la respuesta base de SocialLoginView
        response = super().get_response()

        # Generar un nuevo par de tokens (access y refresh) para el usuario autenticado
        # Esto asegura que la respuesta siempre incluya ambos tokens
        # Usar TokenObtainPairSerializer para generar ambos tokens
        token = TokenObtainPairSerializer.get_token(self.user)
        refresh = token
        access = token.access_token

        # Modificar la respuesta para incluir ambos tokens
        response.data['access_token'] = str(access)
        response.data['refresh_token'] = str(refresh)

        return response
    
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
            # Asegurarse de que el usuario creado sea staff y activo
            user_data['is_staff'] = True
            user_data['is_active'] = True # Establecer explícitamente como activo
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

class AdminManagementViewSet(viewsets.ViewSet):
    """
    ViewSet para que adminglobal gestione usuarios con role='admin'.
    """
    permission_classes = [IsAdminUser] # Solo superusuarios (adminglobal)

    def _is_adminglobal(self, user):
        return user.is_authenticated and user.is_superuser and user.role == 'adminglobal'

    def list(self, request): # Listar admins de cancha
        if not self._is_adminglobal(request.user):
            return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)

        user_repository = DjangoUserRepository()
        get_user_list_use_case = GetUserListUseCase(user_repository)
        
        admins = async_to_sync(get_user_list_use_case.execute)(filters={'role': 'admin'})
        serializer = UserSerializer(admins, many=True)
        return Response(serializer.data)

    # La creación de admins se maneja a través de AdminRegisterView, 
    # que ya está protegida por IsAdminUser.
    # Si se quiere una lógica diferente para adminglobal creando admins, se puede añadir aquí.

    @action(detail=True, methods=['patch'])
    def suspend(self, request, pk=None): # Suspender admin
        if not self._is_adminglobal(request.user):
            return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)

        user_repository = DjangoUserRepository()
        update_user_status_use_case = UpdateUserStatusUseCase(user_repository)
        
        user = async_to_sync(update_user_status_use_case.execute)(user_id=pk, is_active=False)
        if user:
            return Response({"detail": f"Usuario admin {user.username} suspendido."}, status=status.HTTP_200_OK)
        return Response({"detail": "Usuario admin no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def reactivate(self, request, pk=None): # Reactivar admin
        if not self._is_adminglobal(request.user):
            return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)
            
        user_repository = DjangoUserRepository()
        update_user_status_use_case = UpdateUserStatusUseCase(user_repository)

        user = async_to_sync(update_user_status_use_case.execute)(user_id=pk, is_active=True)
        if user:
            return Response({"detail": f"Usuario admin {user.username} reactivado."}, status=status.HTTP_200_OK)
        return Response({"detail": "Usuario admin no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None): # Eliminar admin
        if not self._is_adminglobal(request.user):
            return Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)

        user_repository = DjangoUserRepository()
        delete_user_use_case = DeleteUserUseCase(user_repository)

        success = async_to_sync(delete_user_use_case.execute)(user_id=pk)
        if success:
            return Response({"detail": "Usuario admin eliminado."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Usuario admin no encontrado."}, status=status.HTTP_404_NOT_FOUND)

from rest_framework.generics import RetrieveUpdateAPIView # Importar RetrieveUpdateAPIView
from .serializers import UserProfileUpdateSerializer # Importar el nuevo serializador

class UserProfileUpdateView(RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated] # Solo usuarios autenticados
    queryset = User.objects.all() # Necesario para RetrieveUpdateAPIView, pero get_object lo sobrescribe

    def get_object(self):
        """
        Retorna el usuario autenticado para operaciones de detalle y actualización.
        """
        return self.request.user

class ChangePasswordView(views.APIView):
    """
    Vista para cambiar la contraseña del usuario autenticado.
    """
    permission_classes = [IsAuthenticated] # Solo usuarios autenticados

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({"error": "La contraseña actual y la nueva contraseña son requeridas."}, status=status.HTTP_400_BAD_REQUEST)

        user_repository = DjangoUserRepository()
        change_password_use_case = ChangePasswordUseCase(user_repository) # TODO: Importar ChangePasswordUseCase del backend

        try:
            # Envolver la llamada asíncrona con async_to_sync si el caso de uso es asíncrono
            # Si el caso de uso es síncrono, llamar directamente:
            # change_password_use_case.execute(user, current_password, new_password)
            async_to_sync(change_password_use_case.execute)(user, current_password, new_password)
            return Response({"detail": "Contraseña cambiada exitosamente."}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error interno al cambiar la contraseña: {e}")
            return Response({"error": "Error interno del servidor al cambiar la contraseña."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
