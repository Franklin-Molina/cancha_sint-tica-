from typing import List, Optional, Dict, Any
from django.contrib.auth.hashers import make_password # Para hashear contraseñas
from asgiref.sync import sync_to_async
from django.contrib.auth.models import Group # Importar Group
from ...models import User # Modelo de Django User (backend/users/models.py)
from ...domain.repositories.user_repository import IUserRepository # Interfaz del Dominio

class DjangoUserRepository(IUserRepository):
    """
    Implementación del repositorio de usuarios que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_by_id(self, user_id: int) -> Optional[User]:
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def get_by_username(self, username: str) -> Optional[User]:
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
            
    @sync_to_async
    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def create(self, user_data: Dict[str, Any]) -> User:
        # No es necesario hashear la contraseña aquí, create_user lo hace.
        # if 'password' in user_data:
        #     user_data['password'] = make_password(user_data['password'])
        
        # Crear el usuario
        # Asegurarse de que solo se pasen campos válidos al método create
        # Por ejemplo, si 'password2' está en user_data, eliminarlo
        user_data.pop('password2', None) 
        
        # Crear el usuario con los campos permitidos por el modelo
        # Esto asume que user_data ya ha sido validado por un serializador
        # y solo contiene campos que el modelo User acepta.
        
        # Eliminar la asignación del campo 'role' ya que no está en el modelo User
        # user_data.pop('role', None) # Asegurarse de que 'role' no se pase si no está en el modelo
        
        # Obtener el rol de user_data o usar el default del modelo si no se proporciona
        role = user_data.get('role', User._meta.get_field('role').get_default())

        # Crear el usuario
        user = User.objects.create_user(**user_data)

        # Asignar propiedades y grupos según el rol
        if role == 'adminglobal':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'admin':
            user.is_staff = True
            try:
                gestores_cancha_group = Group.objects.get(name='Gestores de Cancha')
                user.groups.add(gestores_cancha_group)
            except Group.DoesNotExist:
                # Manejar el caso en que el grupo no exista (debería crearse con crear_grupo.py)
                print("Advertencia: El grupo 'Gestores de Cancha' no existe. El usuario admin no se añadió al grupo.")
        # Para 'cliente', is_staff y is_superuser son False por defecto.

        user.save() # Guardar los cambios de is_staff, is_superuser y grupos
        return user

    @sync_to_async
    def update(self, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

        # Actualizar campos del usuario
        for key, value in user_data.items():
            if key == 'password': # Hashear la contraseña si se está actualizando
                setattr(user, key, make_password(value))
            elif hasattr(user, key): # Solo actualizar atributos que existen en el modelo
                setattr(user, key, value)
        
        user.save()
        return user

    @sync_to_async
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[User]:
        queryset = User.objects.all()
        if filters:
            # Aplicar filtros si se proporcionan
            # Ejemplo: filtrar por rol
            if 'role' in filters:
                queryset = queryset.filter(role=filters['role'])
            # Añadir más filtros según sea necesario
        return list(queryset)

    @sync_to_async
    def delete(self, user_id: int) -> bool:
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False

    @sync_to_async
    def set_password(self, user: User, new_password: str) -> None:
        """
        Establece la nueva contraseña para un usuario y la guarda.
        """
        user.set_password(new_password)
        user.save()
