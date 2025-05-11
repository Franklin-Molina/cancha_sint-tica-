from typing import List, Optional, Dict, Any
from ...domain.repositories.booking_repository import IBookingRepository
from ...models import Booking # Asumiendo que Booking está en backend/bookings/models.py
from users.models import User # Para el tipo de usuario

class GetBookingListUseCase:
    """
    Caso de uso para obtener la lista de reservas.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, booking_repository: IBookingRepository):
        self.booking_repository = booking_repository

    async def execute(self, user: Optional[User] = None, filters: Optional[Dict[str, Any]] = None) -> List[Booking]:
        return await self.booking_repository.get_all(user, filters)
