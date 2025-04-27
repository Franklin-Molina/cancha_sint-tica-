from django.urls import path
from .views import CourtList, CourtDetail, CourtAvailabilityView # Importar CourtAvailabilityView

urlpatterns = [
    path('', CourtList.as_view()),
    path('<int:pk>/', CourtDetail.as_view()),
    path('availability/', CourtAvailabilityView.as_view(), name='court-availability'), # Añadir URL para disponibilidad
]
