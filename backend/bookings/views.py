from rest_framework import status, views, viewsets # Importar views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from asgiref.sync import async_to_sync # Importar async_to_sync
from django.views.decorators.csrf import csrf_exempt # Importar csrf_exempt
from django.utils.decorators import method_decorator # Importar method_decorator

from .models import Booking
from .serializers import BookingSerializer
# Quitar importaciones no usadas directamente por la vista si la lógica se mueve
# from payments.models import Payment
# from datetime import timedelta
# from decimal import Decimal

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_booking_repository import DjangoBookingRepository
from .application.use_cases.create_booking import CreateBookingUseCase
from .application.use_cases.get_booking_list import GetBookingListUseCase
from .application.use_cases.get_booking_details import GetBookingDetailsUseCase
from .application.use_cases.update_booking_status import UpdateBookingStatusUseCase


@method_decorator(csrf_exempt, name='dispatch')
class BookingViewSet(viewsets.ModelViewSet): # Cambiar a viewsets.ModelViewSet para operaciones CRUD completas
    permission_classes = [IsAuthenticated] # Por defecto, solo usuarios autenticados

    queryset = Booking.objects.all() # Añadir queryset
    serializer_class = BookingSerializer # Añadir serializer_class
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] # Permitir métodos HTTP explícitamente

    def get_permissions(self):
        # Permitir a administradores realizar cualquier acción
        if self.request.user and self.request.user.is_staff:
            return [IsAdminUser()]
        # Usuarios autenticados pueden listar sus reservas, crear, ver detalles y confirmar/cancelar las suyas
        if self.action in ['list', 'create', 'retrieve', 'confirm', 'cancel']: # 'cancel' se manejará con update_status
            return [IsAuthenticated()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        booking_repository = DjangoBookingRepository()
        create_booking_use_case = CreateBookingUseCase(booking_repository)
        
        # print("DEBUG Backend: Datos de la petición (request.data) antes del serializador:", request.data) # Nuevo log

        # Pasar el usuario al contexto del serializer
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
          #  print("DEBUG Backend: Errores del Serializer:", serializer.errors) # Debug print
          #  print("DEBUG Backend: Datos recibidos (request.data) con errores:", request.data) # Debug print
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
     #   print("DEBUG Backend: Datos validados del serializador (serializer.validated_data):", serializer.validated_data) # Nuevo log

        # El serializer ahora manejará la asignación del usuario si se configura correctamente
        booking_data = serializer.validated_data
        try:
            # El caso de uso ya no necesita el usuario como argumento separado si el serializer lo maneja
            booking = async_to_sync(create_booking_use_case.execute)(booking_data) 
            response_serializer = self.get_serializer(booking)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error interno al crear la reserva."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # La actualización completa (PUT) de una reserva podría no ser común,
    # usualmente se actualiza el estado (ej. cancelar).
    # Si se necesita, se puede implementar de forma similar a create/retrieve.

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_booking_status(self, request, pk=None):
        booking_repository = DjangoBookingRepository()
        update_status_use_case = UpdateBookingStatusUseCase(booking_repository)
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "El campo 'status' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        user_filter = request.user if not request.user.is_staff else None
        
        try:
            booking = async_to_sync(update_status_use_case.execute)(
                booking_id=pk, 
                status=new_status, 
                user=user_filter
            )
            if booking:
                serializer = BookingSerializer(booking, context={'request': request})
                return Response(serializer.data)
            # Si el caso de uso devuelve None, significa que no se encontró la reserva o no hay permiso
            return Response({"detail": "Reserva no encontrada o no tienes permiso para modificarla."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e: # Errores de validación del caso de uso/repositorio
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error interno al actualizar el estado de la reserva."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # La acción 'confirm' se puede manejar a través de 'update_booking_status'
    # enviando 'status': 'CONFIRMED'.
    # Si se necesita una lógica más específica para confirmar, se puede mantener.
    # Por ahora, la eliminaremos para simplificar y usar update_booking_status.
