from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission # Importar Group y Permission
from .models import User, PerfilSocial

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'edad')

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
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'edad', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
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
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()

        # Asignar todos los permisos al administrador
        permission = Permission.objects.all()
        user.user_permissions.set(permission)
        user.save()

        return user

class PerfilSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilSocial
        fields = ('id', 'user', 'provider', 'uid', 'extra_data')
