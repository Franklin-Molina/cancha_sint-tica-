from typing import Dict, Any, Optional
from ...domain.repositories.user_repository import IUserRepository
from ...models import User # Asumiendo que User está en backend/users/models.py

class UpdateUserProfileUseCase:
    """
    Caso de uso para actualizar el perfil de un usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. verificar permisos para actualizar el perfil, etc.)
        return await self.user_repository.update(user_id, user_data)
