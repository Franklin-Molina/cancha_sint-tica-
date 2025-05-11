from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
import django_filters.rest_framework
from asgiref.sync import async_to_sync # Importar async_to_sync
from .models import Court, CourtImage # Importar CourtImage
from bookings.models import Booking # Necesario para CourtAvailabilityView si no se refactoriza completamente
from .serializers import CourtSerializer, CourtImageSerializer # Importar CourtImageSerializer
from .filters import CourtFilter
from datetime import datetime # Necesario para CourtAvailabilityView si no se refactoriza completamente

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_court_repository import DjangoCourtRepository
from .application.use_cases.get_court_list import GetCourtListUseCase
from .application.use_cases.create_court import CreateCourtUseCase
from .application.use_cases.get_court_details import GetCourtDetailsUseCase
from .application.use_cases.update_court import UpdateCourtUseCase
from .application.use_cases.delete_court import DeleteCourtUseCase
from .application.use_cases.check_availability import CheckAvailabilityUseCase


class CourtList(views.APIView): # Cambiar a APIView para manejar la lógica manualmente
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()

    def get(self, request, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        get_court_list_use_case = GetCourtListUseCase(court_repository)
        filters = request.query_params.dict()
        
        # Envolver la llamada asíncrona con async_to_sync
        courts = async_to_sync(get_court_list_use_case.execute)(filters=filters)
        serializer = CourtSerializer(courts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        create_court_use_case = CreateCourtUseCase(court_repository)
        
        serializer = CourtSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            court_data = serializer.validated_data
            images_data = request.FILES.getlist('images')
            
            try:
                # Envolver la llamada asíncrona con async_to_sync
                court = async_to_sync(create_court_use_case.execute)(court_data, images_data)
                response_serializer = CourtSerializer(court, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourtDetail(views.APIView):
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()

    def get(self, request, pk, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        get_court_details_use_case = GetCourtDetailsUseCase(court_repository)
        
        # Envolver la llamada asíncrona con async_to_sync
        court = async_to_sync(get_court_details_use_case.execute)(court_id=pk)
        if court:
            serializer = CourtSerializer(court, context={'request': request})
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        update_court_use_case = UpdateCourtUseCase(court_repository)
        
        serializer = CourtSerializer(data=request.data, partial=False, context={'request': request})
        if serializer.is_valid():
            court_data = serializer.validated_data
            images_data = request.FILES.getlist('images') # Manejar imágenes si se envían
            
            try:
                # Envolver la llamada asíncrona con async_to_sync
                court = async_to_sync(update_court_use_case.execute)(court_id=pk, court_data=court_data, images_data=images_data)
                if court:
                    response_serializer = CourtSerializer(court, context={'request': request})
                    return Response(response_serializer.data)
                return Response(status=status.HTTP_404_NOT_FOUND) # Si la cancha no se encontró para actualizar
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        update_court_use_case = UpdateCourtUseCase(court_repository)
        
        try:
            # Envolver la llamada asíncrona con async_to_sync
            instance = async_to_sync(court_repository.get_by_id)(pk)
            if not instance:
                 return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = CourtSerializer(instance, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            court_data = serializer.validated_data
            images_data = request.FILES.getlist('images')
            
            try:
                # Envolver la llamada asíncrona con async_to_sync
                court = async_to_sync(update_court_use_case.execute)(court_id=pk, court_data=court_data, images_data=images_data)
                if court: # El caso de uso devuelve la cancha actualizada o None
                    response_serializer = CourtSerializer(court, context={'request': request})
                    return Response(response_serializer.data)
                return Response(status=status.HTTP_404_NOT_FOUND) # Si la cancha no se encontró para actualizar
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        court_repository = DjangoCourtRepository()
        delete_court_use_case = DeleteCourtUseCase(court_repository)
        
        # Envolver la llamada asíncrona con async_to_sync
        success = async_to_sync(delete_court_use_case.execute)(court_id=pk)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)


class CourtAvailabilityView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')
        court_id_str = request.query_params.get('court_id')

        if not start_time_str or not end_time_str:
            return Response({"error": "Los parámetros start_time y end_time son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        except ValueError:
            return Response({"error": "Formato de fecha/hora inválido. Use formato ISO 8601."}, status=status.HTTP_400_BAD_REQUEST)
        
        court_id = int(court_id_str) if court_id_str else None

        court_repository = DjangoCourtRepository()
        check_availability_use_case = CheckAvailabilityUseCase(court_repository)
        
        try:
            # Envolver la llamada asíncrona con async_to_sync
            availability_data = async_to_sync(check_availability_use_case.execute)(start_time_str, end_time_str, court_id)
            return Response(availability_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
