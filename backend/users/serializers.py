from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission # Importar Group y Permission
from .models import User, PerfilSocial

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'edad') # Añadir is_active

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    is_staff = serializers.BooleanField(default=False)  # Agregar campo is_staff
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        required=False
    )  # Agregar campo groups

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'edad', 'role', 'is_staff', 'groups')  # Incluir role, is_staff y groups
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': False}, # Hacer role opcional ya que tiene default en el modelo
            'email': {'required': True},
            'edad': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    # Eliminar el método create, ya que la creación se maneja en el repositorio
    # def create(self, validated_data):
    #     validated_data.pop('password2')
    #     password = validated_data.pop('password')
    #     is_staff = validated_data.pop('is_staff', False)
    #     groups = validated_data.pop('groups', [])

    #     user = User.objects.create(**validated_data)
    #     user.set_password(password)
    #     user.is_active = True
    #     user.is_staff = is_staff
    #     user.save()

    #     for group in groups:
    #         user.groups.add(group)

    #     return user

class AdminRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'edad', 'role', 'is_staff', 'is_superuser', 'groups', 'user_permissions') # Añadir role
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': False, 'default': 'admin'}, # Hacer role opcional con default 'admin'
            'email': {'required': True},
            'edad': {'required': True},
            'is_staff': {'default': True},
            'is_superuser': {'default': True},
            'groups': {'required': False},
            'user_permissions': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # El rol se tomará de validated_data (con default 'admin' si no se envía)
        # o se puede forzar aquí si es necesario.
        # role = validated_data.get('role', 'admin') # Asegurar que sea 'admin' si no se especifica
        # validated_data['role'] = role

        # is_staff e is_superuser se manejan en el repositorio basado en el rol.
        # No es necesario establecerlos aquí si el repositorio lo hace.
        # Sin embargo, si este serializador se usa directamente (sin el caso de uso/repositorio),
        # necesitaría manejar la lógica de is_staff/is_superuser aquí.
        # Por ahora, asumimos que la vista usa el caso de uso.

        user = User.objects.create_user(**validated_data) # Usar create_user para hashear contraseña
        # La lógica de is_staff, is_superuser y grupos se maneja en DjangoUserRepository.create
        
        # Si se quiere que este serializador asigne todos los permisos (para adminglobal),
        # esa lógica podría ir aquí, pero es mejor que esté en el repositorio o caso de uso.
        # if user.role == 'adminglobal':
        #     permission = Permission.objects.all()
        #     user.user_permissions.set(permission)
        #     user.save()
            
        return user

class PerfilSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilSocial
        fields = ('id', 'user', 'provider', 'uid', 'extra_data')

# Serializador para actualizar el perfil del usuario
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'edad')
        # No incluir campos sensibles como password o role aquí
        # email puede requerir validación adicional si debe ser único
        extra_kwargs = {
            'email': {'required': False}, # Hacer email opcional en la actualización si no siempre se envía
            'username': {'required': False}, # Hacer username opcional
            'first_name': {'required': False}, # Hacer first_name opcional
            'last_name': {'required': False}, # Hacer last_name opcional
        }

    # Opcional: Añadir validaciones personalizadas si es necesario
    # def validate_email(self, value):
    #     user = self.context['request'].user
    #     if User.objects.exclude(pk=user.pk).filter(email=value).exists():
    #         raise serializers.ValidationError("Este email ya está en uso.")
    #     return value

    # El método update se implementa automáticamente por ModelSerializer
    # si los campos están en `fields` y son editables en el modelo.
    # Si se necesita lógica de actualización personalizada, se puede sobrescribir:
    # def update(self, instance, validated_data):
    #     # Lógica de actualización personalizada si es necesario
    #     return super().update(instance, validated_data)
