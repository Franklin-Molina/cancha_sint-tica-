# TASK.MD - Tareas Iniciales del Proyecto

## Sprint 1: Configuración del Proyecto (1-2 semanas) - INICIADO 13/04/2025
# TASK.MD - Tareas Iniciales del Proyecto

## Sprint 1: Configuración del Proyecto (1-2 semanas) - INICIADO 13/04/2025

### Backend (Django + DRF)
- [ ] Crear repositorio Git y estructura inicial del proyecto
- [ ] Configurar entorno virtual de Python
- [ ] Inicializar proyecto Django y configurar settings.py
- [ ] Configurar conexión con PostgreSQL
- [ ] Implementar Django Rest Framework
- [ ] Configurar sistema de autenticación JWT
- [ ] Configurar OAuth 2.0 para integración con Google:
  - [ ] Obtener credenciales de Google Developer Console
  - [ ] Implementar django-allauth o social-auth-app-django
  - [ ] Configurar rutas de callback y redirección
- [ ] Crear estructura básica de aplicaciones Django:
  - [ ] `users` - Gestión de usuarios y autenticación
  - [ ] `courts` - Gestión de canchas
  - [ ] `bookings` - Sistema de reservas
  - [ ] `payments` - Procesamiento de pagos
  - [ ] `plans` - Planes mensuales
- [ ] Implementar sistema de migraciones inicial
- [ ] Configurar permisos y grupos de usuarios
- [ ] Crear Dockerfile y docker-compose.yml para desarrollo

### Frontend (React)
- [ ] Inicializar proyecto React
- [ ] Configurar estructura de carpetas
- [ ] Configurar sistema de rutas con React Router
- [ ] Implementar estado global (Redux o Context API)
- [ ] Configurar cliente HTTP (Axios) para comunicación con API
- [ ] Implementar componentes básicos UI/UX
- [ ] Integrar React Google Login:
  - [ ] Instalar @react-oauth/google o similar
  - [ ] Configurar botones de autenticación con Google
  - [ ] Manejar flujos de autorización y tokens
- [ ] Crear Dockerfile para frontend
- [ ] Configurar sistema de estilos (CSS Modules o Styled Components)

### Modelado de Datos
- [ ] Diseñar e implementar modelos para:
  - [ ] Usuario (extendiendo el modelo User de Django)
  - [ ] Perfil Social (para almacenar información de cuentas vinculadas de Google)
  - [ ] Cancha (características, precios, disponibilidad)
  - [ ] Reserva (fechas, estado, pagos asociados)
  - [ ] Pago (monto, estado, método)
  - [ ] Plan (periodicidad, precio, beneficios)
- [ ] Crear relaciones entre modelos
- [ ] Implementar validaciones de datos
- [ ] Crear migraciones iniciales

## Sprint 2: APIs Básicas y Autenticación (1-2 semanas)

### Autenticación
- [ ] Implementar endpoints de registro, login y logout tradicionales
- [ ] Desarrollar flujo de autenticación con Google:
  - [ ] Endpoint para iniciar flujo OAuth
  - [ ] Endpoint de callback para procesamiento de tokens
  - [ ] Lógica para crear/actualizar usuarios desde información de Google
  - [ ] Manejo de sincronización de datos entre cuentas locales y Google
- [ ] Configurar middleware de autenticación
- [ ] Implementar recuperación de contraseña (para usuarios con email/password)
- [ ] Crear vistas de perfil de usuario
- [ ] Configurar permisos por roles
- [ ] Implementar enlace/desenlace de cuentas sociales a cuenta existente

### API de Canchas
- [ ] Desarrollar endpoints CRUD para canchas
- [ ] Implementar filtros por características
- [ ] Desarrollar endpoint para consultar disponibilidad
- [ ] Crear serializers con validaciones
- [ ] Configurar permisos de acceso

### API de Reservas
- [ ] Implementar endpoints CRUD para reservas
- [ ] Desarrollar lógica para verificar disponibilidad
- [ ] Implementar regla del 10% de pago anticipado
- [ ] Crear proceso de confirmación de reserva
- [ ] Desarrollar sistema de validación de conflictos horarios

### Frontend Inicial
- [ ] Implementar pantallas de autenticación:
  - [ ] Registro y login tradicional
  - [ ] Botones de autenticación con Google
  - [ ] Manejo de sesión y almacenamiento seguro de tokens
- [ ] Crear componente de visualización de canchas
- [ ] Desarrollar pantalla de perfil de usuario (incluyendo cuentas vinculadas)
- [ ] Implementar calendario/vista de disponibilidad
- [ ] Crear formulario de reserva básico

## Sprint 3: Sistema de Pagos y Planes (2 semanas)

### API de Pagos
- [ ] Investigar e integrar pasarelas de pago (PSE y tarjetas)
- [ ] Implementar endpoints para procesar pagos
- [ ] Desarrollar sistema de webhooks para confirmaciones
- [ ] Crear lógica de facturación
- [ ] Implementar registro de transacciones

### API de Planes
- [ ] Desarrollar endpoints CRUD para planes
- [ ] Implementar lógica de suscripción a planes
- [ ] Crear sistema de renovación automática
- [ ] Configurar recordatorios y notificaciones
- [ ] Desarrollar descuentos para planes

### Frontend de Pagos y Planes
- [ ] Crear formularios de pago seguro
- [ ] Implementar flujo de checkout
- [ ] Desarrollar vista de historial de pagos
- [ ] Crear interfaz para gestión de planes
- [ ] Implementar notificaciones en tiempo real

## Sprint 4: Testing y Documentación (1 semana)

### Testing
- [ ] Configurar sistema de testing
- [ ] Escribir tests unitarios para modelos
- [ ] Implementar tests para APIs
- [ ] Crear tests de integración
- [ ] Realizar testing de frontend
- [ ] Implementar tests específicos para flujos de autenticación social

### Documentación
- [ ] Configurar Swagger/OpenAPI para documentación de API
- [ ] Crear README detallado
- [ ] Documentar proceso de instalación y configuración
- [ ] Escribir documentación para desarrolladores
- [ ] Crear manual de usuario básico
- [ ] Documentar flujo de autenticación con Google

## Sprint 5: Despliegue y CI/CD (1 semana)

### CI/CD
- [ ] Configurar pipeline de CI/CD (GitHub Actions o GitLab CI)
- [ ] Implementar verificación de código (linting)
- [ ] Configurar ejecución automática de tests
- [ ] Implementar builds automáticos
- [ ] Configurar gestión segura de secretos (OAuth credentials)

### Despliegue
- [ ] Preparar configuraciones para entorno de producción
- [ ] Configurar servidor de base de datos PostgreSQL
- [ ] Implementar certificados SSL/TLS
- [ ] Configurar servidor web (Nginx)
- [ ] Realizar pruebas de carga y rendimiento
- [ ] Implementar sistema de monitoreo básico
- [ ] Configurar dominios para redirecciones OAuth

## Próximos Pasos
- Implementar sistema de reportes y estadísticas
- Desarrollar funcionalidades avanzadas de búsqueda
- Crear aplicación móvil o PWA
- Implementar sistema de calificaciones y reseñas
- Añadir integración con redes sociales
- Expandir opciones de autenticación social (Facebook, Apple, etc.)
