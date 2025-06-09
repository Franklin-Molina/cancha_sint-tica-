**Implementar de aquitectura del proyecto**
   - [x] Verificar en frontend si se esta aplicando la aquitectura Clean Architecture 
     *Hallazgos:* Se analizó la estructura de directorios y archivos (`components`, `context`, `pages`, `utils`) y la interacción entre componentes de UI (`pages/HomePage.jsx`), utilidades de API (`utils/api.js`) y contexto de autenticación (`context/AuthContext.jsx`). Se observó que los componentes de la capa de Presentación (`pages/`) y la lógica en el contexto de autenticación (`context/AuthContext.jsx`) tienen dependencias directas con la utilidad de la API (`utils/api.js`), que representa la capa de Infraestructura. Esto va en contra del principio de dependencia hacia adentro de Clean Architecture, donde las capas exteriores (Presentación, Aplicación) no deben depender directamente de las capas interiores (Infraestructura). La organización actual es más típica de una estructura basada en características y tipos de archivos en React, no alineada estrictamente con las capas de Clean Architecture.

## Tareas Pendientes

- [x] Refactorizar `frontend/src/presentation/pages/WeeklyAvailabilityCalendar.jsx` para aplicar Clean Architecture (09/06/2025)
- [x] Aplicar Clean Architecture en el frontend
- [x] Corregir error de doble autenticación con tokens JWT (05/07/2025)
- [x] Aplicar Clean Architecture en el backend (11/05/2025)
  - [x] Refactorizar aplicación `courts` (10/05/2025)
  - [x] Refactorizar aplicación `users` (10/05/2025)
  - [x] Refactorizar aplicación `bookings` (10/05/2025)
  - [x] Refactorizar aplicación `payments` (10/05/2025)
  - [x] Refactorizar aplicación `plans` (11/05/2025)
- [x] Implementar nueva estructura de roles (adminglobal, admin, cliente) (11/05/2025)
  - [x] Backend: Actualizar modelo User, crear grupo "Gestores de Cancha", actualizar lógica de creación de usuarios, crear vistas y URLs para gestión de admins por adminglobal. (11/05/2025)
  - [x] Frontend: Crear dashboard para adminglobal (listar, crear, suspender, reactivar, eliminar admins). (11/05/2025)
