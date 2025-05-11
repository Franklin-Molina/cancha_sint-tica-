from typing import Dict, Any
from ...domain.repositories.user_repository import IUserRepository
from ...models import User # Asumiendo que User está en backend/users/models.py

class RegisterUserUseCase:
    """
    Caso de uso para registrar un nuevo usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_data: Dict[str, Any]) -> User:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. validaciones complejas, envío de email de bienvenida, etc.)
        
        # Verificar si el usuario o email ya existen (opcional, podría estar en el serializador o vista)
        # username_exists = await self.user_repository.get_by_username(user_data.get('username', ''))
        # if username_exists:
        #     raise ValueError("El nombre de usuario ya existe.")
        # email_exists = await self.user_repository.get_by_email(user_data.get('email', ''))
        # if email_exists:
        #     raise ValueError("El email ya está registrado.")

        return await self.user_repository.create(user_data)
