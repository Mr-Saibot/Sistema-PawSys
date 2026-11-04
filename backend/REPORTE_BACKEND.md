# PawSys: estado de la integración

Revisión del código actual: API NestJS/TypeScript con Prisma/MySQL y cliente web independiente en `frondend`. Las compilaciones comprueban tipos y construcción, pero no sustituyen una prueba de integración contra una base MySQL con datos.

## Capacidades conectadas

- Registro de clientes e inicio de sesión JWT.
- Alta administrativa de cuentas de veterinarios y administradores.
- Registro, consulta y baja lógica de mascotas; un cliente solo puede operar sobre las mascotas asociadas a su cuenta.
- Solicitud, listado y cancelación de turnos; clientes ven sus propios turnos y veterinarios los asignados a su perfil.
- Creación de historias, consultas y vacunaciones desde la interfaz veterinaria.
- Administración de la caja, ingresos en efectivo/transferencia QR y egresos.
- Visualización de alias y QR bancario configurados por la clínica.
- Formularios y navegación con estilos responsive para pantallas pequeñas.

## API

La API no tiene prefijo global `/api`. Los grupos disponibles son:

| Grupo | Operaciones |
|---|---|
| Auth | Registro y login públicos; alta de personal para administradores |
| Clientes | CRUD administrativo, listado para el equipo y ruta de mascotas propias |
| Veterinarios | CRUD administrativo, directorio interno y listado mínimo para solicitudes de turno |
| Administradores | CRUD administrativo |
| Mascotas | CRUD con aislamiento por cliente |
| Agendas | CRUD para administración; lectura para veterinarios |
| Turnos | CRUD, cancelación y reprogramación con filtros por rol/propietario |
| Historias clínicas, consultas y vacunaciones | CRUD restringido a veterinarios/administradores; eliminación reservada a administradores |
| Caja, ingresos y egresos | Administración; ingresos y egresos requieren caja abierta |
| Configuración de pagos | Lectura pública de alias, titular e imagen QR, sin secretos |

Se requiere JWT para las rutas de datos. El endpoint de datos mínimos de veterinarios acepta usuarios autenticados de cualquier rol. DTOs se validan globalmente y se rechazan campos desconocidos.

Las rutas `DELETE` de clientes, veterinarios y administradores desactivan la cuenta de usuario para conservar las relaciones clínicas y financieras; los listados y el login excluyen las cuentas desactivadas.

## Límites / siguientes mejoras

- La transferencia/QR es un flujo presencial/manual: la interfaz muestra el código, pero el personal debe comprobar la acreditación y registrar el ingreso. No existe notificación bancaria ni confirmación automática.
- La clínica debe proporcionar su imagen QR y configurar `PAYMENT_QR_IMAGE_URL`, `PAYMENT_ALIAS` y `PAYMENT_HOLDER`.
- Antes de producción hacen falta HTTPS, secretos propios, políticas de respaldo, configuración de dominio/red y pruebas end-to-end con una base aislada.
- Las suites Jest existentes no cubren la integración funcional; actualmente su ejecución puede fallar por incompatibilidad de módulos ESM de las dependencias con la configuración Jest del proyecto.

Consulta el [README principal](../README.md) para instalación, acceso móvil y configuración.
