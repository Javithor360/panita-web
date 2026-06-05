# Tareas Pendientes del Proyecto (Backlog)

## Tareas Principales
- [ ] **Página de Agradecimientos: Sección "Panita del mes"**
  - Implementar la lógica para escoger aleatoriamente cada mes a un usuario (cuyo rol sea diferente a "Miembro").
  - Mostrar la foto de perfil y el nombre de usuario del Panita elegido.
  - Al darle clic, abrir un modal con la información detallada del usuario, incluyendo su historial de participaciones y roles.
- [ ] **Soporte Multimedia en la Galería:**
  - Agregar compatibilidad para renderizar y reproducir archivos de video (`.mp4`, `.webm`) con un reproductor integrado directamente en el visor y los modales.
- [ ] **Protección contra pérdida de datos en Panel Admin:**
  - En los administradores de Usuarios, Rangos y Emblemas: Advertir antes de cerrar o regresar si hay cambios sin guardar.
- [ ] **Gestión de Cuenta:**
  - Agregar una opción para cambiar la contraseña en el perfil de cada usuario.

## Línea de Tiempo Avanzada (V2 - Futuro)
- [ ] **Base de Datos:** Añadir columnas para facción, rol, estado final y hitos.
- [ ] **UI de Tarjetas:** Expandir la interfaz de las tarjetas de la línea de tiempo para mostrar esta "Hoja de Vida".
- [ ] **Panel de Admin:** Permitir asignar hitos desde el panel de administración.

## Para cuando haya un Bot de Discord
- [ ] **Avatares de Discord:** Reemplazar el proveedor actual (`gatecord.com`) en la Server Action `getDiscordAvatar` por consultas directas a nuestra propia API del bot de Discord para obtener los avatares sin depender de terceros.
- [ ] **Sincronización Automática:** Evaluar si el bot de Discord puede sincronizar automáticamente los roles (Staff/Donador) y las descripciones del perfil hacia la base de datos de Prisma para no usar diccionarios estáticos en código.
