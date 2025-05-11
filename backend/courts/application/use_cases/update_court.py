from typing import Dict, Any, Optional, List
from ...domain.repositories.court_repository import ICourtRepository
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class UpdateCourtUseCase:
    """
    Caso de uso para actualizar una cancha existente.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, court_id: int, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Optional[Court]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
        return await self.court_repository.update(court_id, court_data, images_data)
