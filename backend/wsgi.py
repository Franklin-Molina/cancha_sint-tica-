"""
WSGI config for el despliegue en Render.
"""

import os
import sys

# Añadir el directorio actual al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar la aplicación desde el módulo cancha
from cancha.wsgi import application

# Gunicorn buscará este objeto 'application'