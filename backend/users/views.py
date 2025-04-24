from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth.models import Group, Permission
from rest_framework.permissions import IsAdminUser
from .services import crear_grupo_administradores
from django.dispatch import receiver
from django.db.models.signals import post_migrate
from django.apps import AppConfig
from .models import User

class UsersConfig(AppConfig):
    name = 'users'
    def ready(self):
        import users.signals  # Importa el módulo de señales

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == "Administradores":
            return Response({"detail": "No se puede eliminar el grupo Administradores."}, status=400)
        return super().destroy(request, *args, **kwargs)

class PermissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows permissions to be viewed or edited.
    """
    queryset = Permission.objects.all()
    permission_classes = [IsAdminUser]

@receiver(post_migrate)
def create_groups_and_permissions(sender, **kwargs):
    if sender.name == 'users':
        crear_grupo_administradores()
