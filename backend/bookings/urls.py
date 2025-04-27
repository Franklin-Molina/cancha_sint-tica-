from django.urls import path, include # Importar include
from rest_framework.routers import DefaultRouter # Importar DefaultRouter
from .views import BookingViewSet # Importar BookingViewSet

# Crear una instancia del router
router = DefaultRouter()

# Registrar el ViewSet con el router
router.register(r'bookings', BookingViewSet)

# Las URLs generadas por el router se incluyen en urlpatterns
urlpatterns = [
    path('', include(router.urls)),
]
