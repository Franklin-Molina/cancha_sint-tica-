from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError # Importar ValidationError
from plans.models import Plan # Importar el modelo Plan

class User(AbstractUser):
    """
    Modelo de usuario personalizado.
    """
    ROLE_CHOICES = [
        ('adminglobal', 'Administrador Global'),
        ('admin', 'Administrador de Cancha'),
        ('cliente', 'Cliente'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')
    edad = models.IntegerField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)
 
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="users_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="users_permissions",
        related_query_name="user",
    )

    def __str__(self):
        return self.username

class PerfilSocial(models.Model):
    """
    Modelo para almacenar información de perfiles sociales vinculados a un usuario.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    provider = models.CharField(max_length=255)
    uid = models.CharField(max_length=255)
    extra_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.provider}"

class SuscripcionPlan(models.Model):
    """
    Modelo para representar la suscripción de un usuario a un plan.
    """
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('expired', 'Expirada'),
        ('cancelled', 'Cancelada'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suscripciones')
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='suscripciones')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    auto_renew = models.BooleanField(default=True)

    def __str__(self):
        return f"Suscripción de {self.user.username} a {self.plan.name} ({self.status})"

    def clean(self):
        """
        Valida que la fecha de inicio sea anterior o igual a la fecha de fin.
        """
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError({'end_date': 'La fecha de fin debe ser posterior o igual a la fecha de inicio.'})
