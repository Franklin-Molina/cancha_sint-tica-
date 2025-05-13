# GUÍA DE DESARROLLO DEL PROYECTO
siempre hablame en español y los comentarios que hagas en el codigo tambien son en español
# No usar && para combinar multiples comandos, usar ;
# Guarda cada Dependencias e instalaciones
- Cada nueva instalacion o dependencia almacenala en el archivo requirements.txt
# Siempre manten la arquitectura  Clean Architecture

## 1. 🔄 Conciencia y contexto del proyecto
- **Siempre lee 'PLANNING.md'** al comienzo de una nueva conversación para comprender la arquitectura, los objetivos, el estilo y las limitaciones del proyecto.
- **Revisa 'TASK.md'** antes de comenzar una nueva tarea. Si la tarea no aparece en la lista, agrégala con una breve descripción y la fecha de hoy.
- **Utiliza convenciones de nomenclatura, estructura de archivos y patrones de arquitectura coherentes** como se describe en 'PLANNING.md'.
 
## 2. 🧱 Estructura y modularidad del código
- **Nunca crees un archivo de más de 500 líneas de código.** Si un archivo se acerca a este límite, refactoriza dividiéndolo en módulos o archivos auxiliares.
- **Organiza el código en módulos claramente separados**, agrupados por característica o responsabilidad.
- **Utiliza importaciones claras y coherentes** (prefiere las importaciones relativas dentro de los paquetes).
 
## 3. 🧪 Pruebas y confiabilidad
- **Crea siempre pruebas unitarias de Pytest para nuevas características** (funciones, clases, rutas, etc.).
- **Después de actualizar cualquier lógica**, comprueba si es necesario actualizar las pruebas unitarias existentes. Si es así, hazlo.
- **Las pruebas deben residir en una carpeta '/tests'** que refleje la estructura principal de la aplicación.
  - Incluir al menos:
    1. Una prueba de uso esperado
    2. Un caso periférico
    3. Un caso de fallo
 
## 4. ✅ Finalización de tareas
- **Marca las tareas completadas en 'TASK.md'** inmediatamente después de terminarlas.
- **Agrega nuevas subtareas o tareas pendientes** descubiertas durante el desarrollo a "TASK.md" en la sección "Detectadas durante el trabajo".
 
## 5. 📎 Estilo y convenciones
React.js

- **Utiliza 'React.js' para el Frontend**.
- **Utiliza 'Django + DRF' para el backend**.
- **Utiliza 'PostgreSQL' para la base de datos**.
- **Utiliza 'pydantic' para la validación de datos**.
- **Escribe docstrings para cada función** usando el estilo de Google:
  ```python
  def ejemplo():
      """
      Breve resumen.
 
      Args:
          param1 (tipo): Descripción.
 
      Returns:
          tipo: Descripción.
      """