# TASK.MD - Tareas Iniciales del Proyecto

## Sprint 1: Configuración del Proyecto (1-2 semanas) - INICIADO 13/04/2025

### Backend (Django + DRF)
- [x] Crear repositorio Git y estructura inicial del proyecto
- [x] Configurar entorno virtual de Python
- [x] Inicializar proyecto Django y configurar settings.py
- [x] Configurar conexión con PostgreSQL
- [x] Implementar Django Rest Framework
- [x] Configurar sistema de autenticación JWT
- [x] Configurar OAuth 2.0 para integración con Google:
  - [x] Obtener credenciales de Google Developer Console
  - [x] Implementar django-allauth o social-auth-app-django
  - [x] Configurar rutas de callback y redirección
- [x] Crear estructura básica de aplicaciones Django:
  - [x] `users` - Gestión de usuarios y autenticación
  - [x] `courts` - Gestión de canchas
  - [x] `bookings` - Sistema de reservas
  - [x] `payments` - Procesamiento de pagos
  - [x] `plans` - Planes mensuales
- [x] Implementar sistema de migraciones inicial
- [x] Configurar permisos y grupos de usuarios
- [x] Crear Dockerfile y docker-compose.yml para desarrollo

### Frontend (React)
- [x] Inicializar proyecto React
- [x] Configurar estructura de carpetas
- [x] Configurar sistema de rutas con React Router
- [x] Implementar estado global (Redux o Context API)
- [x] Configurar cliente HTTP (Axios) para comunicación con API
- [x] Implementar componentes básicos UI/UX
- [x] Integrar React Google Login:
  - [x] Instalar @react-oauth/google o similar
  - [x] Configurar botones de autenticación con Google
  - [x] Manejar flujos de autorización y tokens
- [x] Crear Dockerfile para frontend
- [x] Configurar sistema de estilos (Styled Components)

### Modelado de Datos
- [ ] Diseñar e implementar modelos para:
  - [x] Usuario (extendiendo el modelo User de Django)
  - [x] Perfil Social (para almacenar información de cuentas vinculadas de Google)
  - [x] Cancha (características, precios, disponibilidad)
  - [x] Reserva (fechas, estado, pagos asociados)
  - [x] Pago (monto, estado, método)
  - [x] Plan (periodicidad, precio, beneficios)
- [x] Crear relaciones entre modelos
- [x] Implementar validaciones de datos
- [x] Crear migraciones iniciales

## Sprint 2: APIs Básicas y Autenticación (1-2 semanas)

### Autenticación
- [x] Implementar endpoints de registro, login y logout tradicionales
- [x] Desarrollar flujo de autenticación con Google:
  - [x] Endpoint para iniciar flujo OAuth
  - [x] Endpoint de callback para procesamiento de tokens
  - [x] Lógica para crear/actualizar usuarios desde información de Google
  - [x] Manejo de sincronización de datos entre cuentas locales y Google
- [x] Configurar middleware de autenticación
- [x] Implementar recuperación de contraseña (para usuarios con email/password)
- [x] Crear vistas de perfil de usuario
- [x] Configurar permisos por roles
- [x] Implementar enlace/desenlace de cuentas sociales a cuenta existente

### API de Canchas
- [x] Desarrollar endpoints CRUD para canchas
- [x] Implementar filtros por características
- [x] Desarrollar endpoint para consultar disponibilidad
- [x] Crear serializers con validaciones
- [x] Configurar permisos de acceso

### API de Reservas
- [x] Implementar endpoints CRUD para reservas
- [x] Desarrollar lógica para verificar disponibilidad
- [x] Implementar regla del 10% de pago anticipado
- [x] Crear proceso de confirmación de reserva
- [x] Desarrollar sistema de validación de conflictos horarios

### Frontend Inicial
- [x] Implementar pantallas de autenticación:
  - [x] Registro y login tradicional
  - [x] Botones de autenticación con Google
  - [x] Manejo de sesión y almacenamiento seguro de tokens (incluida la protección de rutas con ProtectedRoute)
- [x] Crear componente de visualización de canchas
- [x] Desarrollar pantalla de perfil de usuario (incluyendo cuentas vinculadas)
- [x] Implementar calendario/vista de disponibilidad
- [x] Crear formulario de reserva básico

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
- [ ] Modificar el estilo de la página de registro de acuerdo a `/components/future/register.html` - 28/04/2025
- Implementar sistema de calificaciones y reseñas
- Añadir integración con redes sociales
- Expandir opciones de autenticación social (Facebook, Apple, etc.)

## Detectadas durante el trabajo
- [x] Corregir error "Method Not Allowed" en el endpoint de login.
- [x] Reajustar login para acceder con username y password.
- [x] Redirigir al usuario a una nueva página después del login y mostrar el nombre de usuario.
- [x] Asegurar que los nuevos usuarios estén activos por defecto al registrarse.
- [ ] El inicio de sesión con Google dejó de funcionar.
