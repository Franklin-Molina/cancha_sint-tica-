from django.db import models
from django.contrib.auth.models import AbstractUser, Group

class User(AbstractUser):
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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    provider = models.CharField(max_length=255)
    uid = models.CharField(max_length=255)
    extra_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.provider}"
