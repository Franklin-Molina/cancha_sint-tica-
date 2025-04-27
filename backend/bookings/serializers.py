from rest_framework import serializers
from rest_framework.exceptions import ValidationError # Importar ValidationError
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

    def validate(self, data):
        """
        Valida que la cancha no esté reservada en el rango de tiempo solicitado.
        """
        court = data.get('court')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if not court or not start_time or not end_time:
            # La validación a nivel de campo ya debería manejar esto,
            # pero es bueno tener una verificación aquí también.
            return data

        # Excluir la instancia actual si se está actualizando una reserva existente
        instance = self.instance
        if instance:
            overlapping_bookings = Booking.objects.filter(
                court=court,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            ).exclude(pk=instance.pk)
        else:
            overlapping_bookings = Booking.objects.filter(
                court=court,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            )

        if overlapping_bookings.exists():
            raise ValidationError("La cancha no está disponible en el rango de tiempo solicitado.")

        # Validar que la hora de inicio sea anterior a la hora de fin (ya validado en el modelo, pero se puede reforzar aquí)
        if start_time >= end_time:
             raise ValidationError({'end_time': 'La hora de fin debe ser posterior a la hora de inicio.'})


        return data
