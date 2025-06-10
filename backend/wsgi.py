# Este archivo sirve como punto de entrada para Gunicorn en Render
from cancha.wsgi import application

# Esto es necesario para que Gunicorn encuentre la aplicación
if __name__ == "__main__":
    application.run()