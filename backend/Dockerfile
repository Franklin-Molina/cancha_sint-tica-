# Usar una imagen base de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de requisitos e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . .

# Recolectar archivos estáticos y ejecutar migraciones
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

# Exponer el puerto en el que se ejecuta Django
EXPOSE 8000

# Comando para ejecutar la aplicación Django con Gunicorn
# Asegurarnos de que Python pueda encontrar los módulos
ENV PYTHONPATH=/app

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--pythonpath", "/app", "wsgi:application"]
