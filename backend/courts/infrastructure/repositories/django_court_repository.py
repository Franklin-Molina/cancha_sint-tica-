from typing import List, Optional, Dict, Any
from django.db import transaction
from asgiref.sync import sync_to_async # Importar sync_to_async
from ...models import Court, CourtImage # Modelos de Django
from ...domain.repositories.court_repository import ICourtRepository # Interfaz del Dominio
from ...filters import CourtFilter # Asumiendo que CourtFilter está en backend/courts/filters.py
from django.utils import timezone # Para check_availability
from django.db.models import Q # Para queries complejas en check_availability

class DjangoCourtRepository(ICourtRepository):
    """
    Implementación del repositorio de canchas que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Court]:
        queryset = Court.objects.all().prefetch_related('images')
        if filters:
            # Aplicar filtros usando CourtFilter si se proporcionan
            # Esto asume que CourtFilter puede manejar un diccionario de filtros
            # o que adaptamos los filtros al formato que espera CourtFilter.
            # Por simplicidad, aquí se podría hacer un filtrado directo si los filtros son simples.
            # Ejemplo: queryset = queryset.filter(**filters)
            # Para usar CourtFilter, necesitaríamos instanciarlo y pasarle los datos.
            # Esto podría requerir que los filtros estén en un formato específico (ej. request.GET)
            # o adaptar esta parte.
            # Por ahora, asumimos que CourtFilter se puede usar con un queryset y un diccionario de filtros.
            # Si CourtFilter está diseñado para usarse con request.GET, esta parte necesitará ajuste.
            # Una forma simple sería:
            if 'name__icontains' in filters:
                 queryset = queryset.filter(name__icontains=filters['name__icontains'])
            # ... añadir más filtros según sea necesario
            # O, si CourtFilter puede tomar un queryset y un diccionario de datos:
            # court_filter = CourtFilter(data=filters, queryset=queryset)
            # queryset = court_filter.qs
        
        # Usar sync_to_async para operaciones de base de datos síncronas
        return await sync_to_async(list)(queryset)

    async def get_by_id(self, court_id: int) -> Optional[Court]:
        try:
            # Usar sync_to_async para operaciones de base de datos síncronas
            return await sync_to_async(Court.objects.prefetch_related('images').get)(pk=court_id)
        except Court.DoesNotExist:
            return None

    @sync_to_async # Envolver todo el método transaccional
    @transaction.atomic 
    def _create_court_sync(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        images_to_create = court_data.pop('images', images_data or [])
        court = Court.objects.create(**court_data)
        if images_to_create:
            for image_file in images_to_create:
                CourtImage.objects.create(court=court, image=image_file)
        return court

    async def create(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        return await self._create_court_sync(court_data, images_data)

    @sync_to_async
    @transaction.atomic
    def _update_court_sync(self, court: Court, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        images_to_create = court_data.pop('images', images_data or [])
        for key, value in court_data.items():
            setattr(court, key, value)
        court.save()

        if images_to_create:
            for image_file in images_to_create:
                CourtImage.objects.create(court=court, image=image_file)
        return court

    async def update(self, court_id: int, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Optional[Court]:
        court = await self.get_by_id(court_id) # get_by_id ya es async
        if not court:
            return None
        return await self._update_court_sync(court, court_data, images_data)

    @sync_to_async
    def _delete_court_sync(self, court: Court) -> None:
        court.delete()

    async def delete(self, court_id: int) -> bool:
        court = await self.get_by_id(court_id) # get_by_id ya es async
        if not court:
            return False
        await self._delete_court_sync(court)
        return True

    @sync_to_async
    def _check_availability_sync(self, start_time_str: str, end_time_str: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        start_dt = timezone.datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_dt = timezone.datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))

        courts_to_check = Court.objects.all()
        if court_id:
            courts_to_check = courts_to_check.filter(pk=court_id)

        availability_results = []
        for court_obj in courts_to_check: # Renombrar variable para evitar conflicto con el modelo Court
            overlapping_bookings = court_obj.booking_set.filter(
                Q(start_time__lt=end_dt) & Q(end_time__gt=start_dt) &
                ~Q(status='CANCELLED')
            ).exists()

            availability_results.append({
                'id': court_obj.id,
                'name': court_obj.name,
                'is_available': not overlapping_bookings
            })
        return availability_results

    async def check_availability(self, start_time: str, end_time: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        return await self._check_availability_sync(start_time, end_time, court_id)
