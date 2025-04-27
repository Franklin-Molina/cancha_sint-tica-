from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User # Importar el modelo User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Definir explícitamente los campos esperados
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True) # write_only=True para que no se incluya en la respuesta

    def validate(self, attrs):
        # Acceder a los datos validados
        username = attrs.get('username')
        password = attrs.get('password')

        # Imprimir los atributos recibidos para depuración
        import logging
        logger = logging.getLogger(__name__)

        import logging
        logger = logging.getLogger(__name__)

        logger.debug(f"Atributos recibidos en el serializador: {attrs}")
        logger.debug(f"Intentando autenticar usuario: {username}")

        # La validación de campos requeridos ya la maneja DRF con required=True
        # Solo necesitamos validar las credenciales si ambos campos están presentes
        # Obtener el usuario por username
        # Verificar la contraseña usando authenticate
        try:
            user = authenticate(username=username, password=password)
            logger.debug(f"Resultado de authenticate: {user}")

            if user is None:
                logger.debug("Autenticación fallida: usuario no encontrado o credenciales inválidas.")
                raise serializers.ValidationError("Credenciales inválidas", code="authorization")

            logger.debug(f"Usuario autenticado: {user.username}, is_active: {user.is_active}")

            # Asegurarse de que el usuario esté activo
            if not user.is_active:
                logger.debug(f"Autenticación fallida: usuario {user.username} inactivo.")
                raise serializers.ValidationError("La cuenta de usuario está inactiva.", code="authorization")

        except Exception as e:
            logger.error(f"Error durante la autenticación: {e}", exc_info=True)
            raise serializers.ValidationError("Error interno durante la autenticación.", code="internal_error")

        # Opcional: Imprimir validadores de contraseña (para depuración avanzada si es necesario)
        # from django.contrib.auth.password_validation import get_password_validators
        # logger.debug(f"Validadores de contraseña: {get_password_validators()}")

        # Si la autenticación es exitosa, podemos proceder a obtener los tokens
        # La clase base TokenObtainPairSerializer espera que el usuario autenticado
        # esté disponible en self.user. Lo asignamos aquí.
        self.user = user

        # Llamar a la validación de la clase base para obtener los tokens
        # Pasar los attrs originales que contienen username y password
        data = super().validate(attrs)

        # Añadir información adicional del usuario a la respuesta
        data["email"] = user.email # Mantener email en la respuesta si es necesario
        data["user_id"] = user.id
        data["username"] = user.username # Añadir username a la respuesta
        #data["password"] = user.password
        return data
