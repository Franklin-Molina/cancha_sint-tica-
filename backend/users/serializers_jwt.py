from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
import logging
import re

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Campos esperados
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        logger.debug(f"Atributos recibidos en el serializador: {attrs}")
        logger.debug(f"Intentando autenticar usuario: {username}")

        # Verificación para evitar que se pasen tokens JWT como credenciales
        jwt_pattern = re.compile(r'^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$')
        if jwt_pattern.match(username) or jwt_pattern.match(password):
            logger.debug("Se detectó un token JWT enviado como username o password.")
            raise serializers.ValidationError("Formato inválido para usuario o contraseña.", code="invalid_format")

        try:
            user = authenticate(username=username, password=password)
            logger.debug(f"Resultado de authenticate: {user}")

            if user is None:
                logger.debug("Autenticación fallida: usuario no encontrado o credenciales inválidas.")
                raise serializers.ValidationError("Credenciales inválidas", code="authorization")

            if not user.is_active:
                logger.debug(f"Autenticación fallida: usuario {user.username} inactivo.")
                raise serializers.ValidationError("La cuenta de usuario está inactiva.", code="authorization")

            logger.debug(f"Usuario autenticado: {user.username}, is_active: {user.is_active}")

        except Exception as e:
            logger.error(f"Error durante la autenticación: {e}", exc_info=True)
            raise serializers.ValidationError("Error interno durante la autenticación.", code="internal_error")

        # Asignar el usuario autenticado para que la clase base genere los tokens
        self.user = user
        data = super().validate(attrs)

        # Añadir datos adicionales al payload de respuesta si es necesario
        data["email"] = user.email
        data["user_id"] = user.id
        data["username"] = user.username

        return data
