from django.db import models
from django.core.exceptions import ValidationError # Importar ValidationError

class Court(models.Model):
    """
    Modelo para representar una cancha sintética.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    characteristics = models.TextField(blank=True, help_text="Características específicas de la cancha (ej: tipo de superficie, tamaño, si es techada)")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True, help_text="Indica si la cancha está activa o suspendida.")
    # La disponibilidad se gestionará a través del modelo de Reservas

    def __str__(self):
        return self.name

    def clean(self):
        """
        Valida que el precio de la cancha sea un valor no negativo.
        """
        if self.price is not None and self.price < 0:
            raise ValidationError({'price': 'El precio no puede ser negativo.'})

class CourtImage(models.Model):
    """
    Modelo para representar una imagen asociada a una cancha.
    """
    court = models.ForeignKey(Court, related_name='images', on_delete=models.CASCADE) # Relación con el modelo Court
    image = models.ImageField(upload_to='courts/images/') # Campo para la imagen

    def __str__(self):
        return f"Image for {self.court.name}"
