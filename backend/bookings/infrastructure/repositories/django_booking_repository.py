from typing import List, Optional, Dict, Any
from django.db import transaction
from asgiref.sync import sync_to_async
from django.utils import timezone
from decimal import Decimal

from ...models import Booking # Modelo de Django Booking
from users.models import User # Modelo de Django User
from courts.models import Court # Modelo de Django Court
from payments.models import Payment # Modelo de Django Payment
from ...domain.repositories.booking_repository import IBookingRepository # Interfaz del Dominio

class DjangoBookingRepository(IBookingRepository):
    """
    Implementación del repositorio de reservas que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_all(self, user: Optional[User] = None, filters: Optional[Dict[str, Any]] = None) -> List[Booking]:
        queryset = Booking.objects.all().select_related('court', 'user', 'payment')
        if user:
            queryset = queryset.filter(user=user)
        if filters:
            # Aplicar filtros adicionales si se proporcionan
            # Ejemplo: queryset = queryset.filter(**filters)
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            # Añadir más filtros según sea necesario
        return list(queryset)

    @sync_to_async
    def get_by_id(self, booking_id: int, user: Optional[User] = None) -> Optional[Booking]:
        try:
            query = Booking.objects.select_related('court', 'user', 'payment')
            if user: # Si se proporciona un usuario, filtrar por ese usuario
                return query.get(pk=booking_id, user=user)
            return query.get(pk=booking_id) # Si no, obtener por ID (para admin)
        except Booking.DoesNotExist:
            return None

    @sync_to_async
    @transaction.atomic # Asegurar que la creación de la reserva y el pago sea atómica
    def create(self, booking_data: Dict[str, Any], user: User) -> Booking:
        court_id = booking_data.get('court')
        start_time_str = booking_data.get('start_time')
        end_time_str = booking_data.get('end_time')

        if not all([court_id, start_time_str, end_time_str]):
            raise ValueError("Court ID, start time, and end time are required to create a booking.")

        try:
            court = Court.objects.get(pk=court_id)
        except Court.DoesNotExist:
            raise ValueError(f"Court with id {court_id} does not exist.")

        start_time = timezone.datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = timezone.datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        
        # Validar disponibilidad (simplificado, una lógica más robusta podría estar en un servicio de dominio o caso de uso)
        overlapping_bookings = Booking.objects.filter(
            court=court,
            start_time__lt=end_time,
            end_time__gt=start_time,
            status__in=['PENDING', 'CONFIRMED']
        ).exists()

        if overlapping_bookings:
            raise ValueError("The court is not available for the selected time.")

        # Calcular duración y precio (simplificado)
        duration_hours = (end_time - start_time).total_seconds() / 3600
        total_price = court.price * Decimal(duration_hours)
        
        # Crear el pago (asumiendo un pago inicial del 10% o completo)
        # Esta lógica podría ser más compleja y estar en un servicio de pagos.
        payment_amount = total_price # Asumir pago completo por ahora
        payment = Payment.objects.create(
            user=user,
            amount=payment_amount,
            status='PENDING', # O 'COMPLETED' si se procesa inmediatamente
            payment_method='CASH' # Valor por defecto o a determinar
        )

        booking = Booking.objects.create(
            user=user,
            court=court,
            start_time=start_time,
            end_time=end_time,
            status='PENDING', # Estado inicial de la reserva
            payment=payment
        )
        return booking

    @sync_to_async
    @transaction.atomic
    def update_status(self, booking_id: int, status: str, user: Optional[User] = None) -> Optional[Booking]:
        try:
            booking = Booking.objects.select_related('payment').get(pk=booking_id)
            
            # Si se proporciona un usuario (no admin), verificar que la reserva le pertenece
            if user and booking.user != user:
                return None # O lanzar un error de permiso

            booking.status = status
            # Lógica adicional si el estado es 'CANCELLED' (ej. reembolsar pago)
            if status == 'CANCELLED' and booking.payment:
                booking.payment.status = 'REFUNDED' # O un estado similar
                booking.payment.save()
            
            booking.save()
            return booking
        except Booking.DoesNotExist:
            return None
