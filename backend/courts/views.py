from rest_framework import generics, status # Importar status
from rest_framework.views import APIView # Importar APIView
from rest_framework.response import Response # Importar Response
from rest_framework.permissions import AllowAny, IsAdminUser # Importar clases de permisos
import django_filters.rest_framework # Importar el backend de filtro
from .models import Court
from bookings.models import Booking # Importar el modelo Booking
from .serializers import CourtSerializer
from .filters import CourtFilter # Importar el filtro
from datetime import datetime # Importar datetime

class CourtList(generics.ListCreateAPIView):
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend] # Añadir backend de filtro
    filterset_class = CourtFilter # Especificar la clase de filtro
    permission_classes = [IsAdminUser] # Por defecto, solo administradores pueden crear

    def get_permissions(self):
        """
        Permite a cualquier usuario listar canchas (GET).
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()


class CourtDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    permission_classes = [IsAdminUser] # Por defecto, solo administradores pueden actualizar/eliminar

    def get_permissions(self):
        """
        Permite a cualquier usuario ver detalles de una cancha (GET).
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()


class CourtAvailabilityView(APIView):
    """
    Vista para consultar la disponibilidad de las canchas en un rango de tiempo.
    """
    permission_classes = [AllowAny] # Permitir a cualquier usuario consultar disponibilidad

    def get(self, request, *args, **kwargs):
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')

        if not start_time_str or not end_time_str:
            return Response({"error": "Los parámetros start_time y end_time son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Asumir formato ISO 8601 (ej: 2023-10-27T10:00:00Z)
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        except ValueError:
            return Response({"error": "Formato de fecha/hora inválido. Use formato ISO 8601."}, status=status.HTTP_400_BAD_REQUEST)

        if start_time >= end_time:
             return Response({"error": "La hora de inicio debe ser anterior a la hora de fin."}, status=status.HTTP_400_BAD_REQUEST)

        courts = Court.objects.all()
        availability_data = []

        for court in courts:
            # Buscar reservas que se superpongan con el rango solicitado
            # Una reserva se superpone si:
            # (start_time < existing_end_time) AND (end_time > existing_start_time)
            overlapping_bookings = Booking.objects.filter(
                court=court,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed'] # Considerar solo reservas pendientes o confirmadas
            ).exists() # Usar exists() para eficiencia

            availability_data.append({
                'id': court.id,
                'name': court.name,
                'is_available': not overlapping_bookings # Está disponible si no hay reservas superpuestas
            })

        return Response(availability_data, status=status.HTTP_200_OK)
