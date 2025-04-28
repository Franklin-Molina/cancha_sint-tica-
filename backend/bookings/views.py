from rest_framework import generics, status # Importar status
from rest_framework.views import APIView # Importar APIView
from rest_framework.response import Response # Importar Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Importar IsAuthenticated y IsAdminUser
from rest_framework.decorators import action
from rest_framework import viewsets
from .models import Booking
from .serializers import BookingSerializer # Importar BookingSerializer
from payments.models import Payment # Importar el modelo Payment
from datetime import timedelta # Importar timedelta
from decimal import Decimal # Importar Decimal para cálculos precisos

# Mantener BookingList si se necesita una vista separada para listar/crear
# class BookingList(generics.ListCreateAPIView):
#     queryset = Booking.objects.all()
#     serializer_class = BookingSerializer
#     permission_classes = [IsAuthenticated] # Solo usuarios autenticados pueden listar/crear

#     def perform_create(self, serializer):
#         # Guardar la instancia de la reserva primero para obtener un PK
#         instance = serializer.save(user=self.request.user) # Asignar el usuario autenticado

#         # Calcular la duración de la reserva en horas (o la unidad de tiempo relevante)
#         duration = (instance.end_time - instance.start_time).total_seconds() / 3600 # Duración en horas

#         # Asumir que el precio de la cancha es por hora. Ajustar si es por otro período.
#         # Si el precio es por reserva completa, usar instance.court.price directamente.
#         # Por ahora, asumiré que el precio es por hora y la reserva es por horas completas o fracciones.
#         # Si las reservas son por bloques de tiempo fijos (ej: 1 hora), el cálculo sería diferente.
#         # Para simplificar, asumiré que el precio es por hora y calculo el costo total.
#         costo_total = instance.court.price * Decimal(str(duration))

#         # Calcular el monto del pago anticipado (10%)
#         monto_anticipo = costo_total * Decimal('0.10')

#         # Crear un objeto Payment asociado a la reserva
#         payment = Payment.objects.create(
#             user=self.request.user,
#             booking=instance,
#             amount=monto_anticipo,
#             status='pending', # Estado inicial pendiente
#             method='anticipo' # Método indicando que es el anticipo
#         )

#         # Asociar el pago a la instancia de la reserva
#         instance.payment = payment
#         instance.save()


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo Booking, proporcionando operaciones CRUD y acciones personalizadas.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser] # Cambiado a IsAdminUser para restringir acceso al dashboard

    def perform_create(self, serializer):
        # Guardar la instancia de la reserva primero para obtener un PK
        instance = serializer.save(user=self.request.user) # Asignar el usuario autenticado

        # Calcular la duración de la reserva en horas (o la unidad de tiempo relevante)
        duration = (instance.end_time - instance.start_time).total_seconds() / 3600 # Duración en horas

        # Asumir que el precio de la cancha es por hora. Ajustar si es por otro período.
        # Si el precio es por reserva completa, usar instance.court.price directamente.
        # Por ahora, asumiré que el precio es por hora y la reserva es por horas completas o fracciones.
        # Si las reservas son por bloques de tiempo fijos (ej: 1 hora), el cálculo sería diferente.
        # Para simplificar, asumiré que el precio es por hora y calculo el costo total.
        costo_total = instance.court.price * Decimal(str(duration))

        # Calcular el monto del pago anticipado (10%)
        monto_anticipo = costo_total * Decimal('0.10')

        # Crear un objeto Payment asociado a la reserva
        payment = Payment.objects.create(
            user=self.request.user,
            booking=instance,
            amount=monto_anticipo,
            status='pending', # Estado inicial pendiente
            method='anticipo' # Método indicando que es el anticipo
        )

        # Asociar el pago a la instancia de la reserva
        instance.payment = payment
        instance.save()


    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirma una reserva pendiente.
        """
        try:
            booking = self.get_object()
        except Booking.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Verificar permisos: solo el propietario de la reserva o un administrador pueden confirmar
        if booking.user != request.user and not request.user.is_staff:
             return Response({"detail": "No tienes permiso para confirmar esta reserva."}, status=status.HTTP_403_FORBIDDEN)


        if booking.status == 'pending':
            booking.status = 'confirmed'
            booking.save()
            serializer = self.get_serializer(booking)
            return Response(serializer.data)
        else:
            return Response({"detail": "La reserva no está pendiente y no puede ser confirmada."}, status=status.HTTP_400_BAD_REQUEST)
