from rest_framework import serializers
from .models import Court, CourtImage # Importar CourtImage

class CourtImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtImage
        fields = ['id', 'image'] # Campos del serializador de imagen

class CourtSerializer(serializers.ModelSerializer):
    images = CourtImageSerializer(many=True, read_only=True) # Campo para las imágenes, read_only para la representación

    class Meta:
        model = Court
        fields = ['id', 'name', 'description', 'characteristics', 'price', 'is_active', 'images'] # Incluir 'images' en los campos

    def create(self, validated_data):
        # Lógica para crear la cancha y manejar las imágenes asociadas
        # Las imágenes se manejarán en la vista, no directamente en el serializador de creación de la cancha principal
        # Este serializador se usará principalmente para listar y actualizar (si se implementa)
        return Court.objects.create(**validated_data)
