from django.urls import path
from .views import CourtList, CourtDetail

urlpatterns = [
    path('', CourtList.as_view()),
    path('<int:pk>/', CourtDetail.as_view()),
]
