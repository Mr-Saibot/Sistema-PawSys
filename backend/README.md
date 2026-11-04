# API PawSys

API REST con NestJS, TypeScript, Prisma y MySQL. La configuración de desarrollo y los comandos generales están en el [README del proyecto](../README.md).

## Configuración

Usa `backend/.env.example` como referencia para crear `backend/.env`. Configura `DATABASE_URL`, un `JWT_SECRET` aleatorio y largo, `PORT`, `FRONTEND_URL` y, opcionalmente, `PAYMENT_ALIAS`, `PAYMENT_HOLDER` y `PAYMENT_QR_IMAGE_URL`.

El backend rechaza el secreto JWT de ejemplo y no tiene un secreto fijo alternativo. `FRONTEND_URL` acepta uno o más orígenes, separados por comas. No sincronices el esquema con una base que ya tenga datos sin respaldo y revisión previa.

## Rutas

No hay prefijo global `/api`.

| Grupo | Rutas principales |
|---|---|
| Autenticación | `POST /auth/register`, `POST /auth/login`; administrador: `POST /auth/usuarios` para crear cuentas de personal |
| Clientes | CRUD `/clientes`; `GET /clientes/me/mascotas` |
| Veterinarios | CRUD `/veterinarios`; listado público de datos mínimos `GET /veterinarios/disponibles` para turnos |
| Mascotas | CRUD `/mascotas` |
| Agenda | CRUD `/agendas` |
| Turnos | CRUD `/turnos`, `PATCH /turnos/:id/cancelar`, `PATCH /turnos/:id/reprogramar` |
| Historia clínica | CRUD `/historiales-clinicos`, `GET /historiales-clinicos/mascota/:mascotaId` |
| Atención | CRUD `/consultas` y `/vacunaciones` |
| Caja | `GET /caja`, `POST /caja/abrir`, `POST /caja/:id/cerrar`, `GET /caja/:id/reporte-diario` |
| Ingresos y egresos | `GET/POST /ingresos`, `GET/POST /egresos` |
| Configuración pública | `GET /configuracion/pagos` devuelve alias/titular/URL pública del QR, no credenciales |

Las rutas de datos requieren JWT. Registro/login, la ruta raíz y la información pública de pagos no requieren sesión; `GET /veterinarios/disponibles` sí requiere JWT y devuelve solo los campos necesarios para elegir profesional.

## Permisos generales

- Cliente: accede a sus mascotas y turnos; puede crear mascotas propias y solicitar/cancelar sus turnos.
- Veterinario: consulta los pacientes y turnos asignados y gestiona registros clínicos.
- Administrador: gestiona personal, datos generales y caja.
- Ingresos, egresos y operaciones de caja son exclusivas de administradores. El responsable del movimiento se obtiene del perfil autenticado.

Se validan DTOs globalmente, se rechazan propiedades no declaradas y los saldos de caja se actualizan dentro de la transacción que registra cada movimiento.

## Ejecución y verificación

Desde esta carpeta: `npm run start:dev`, `npm run build`, `npm run lint` o `npm test -- --runInBand`. La interfaz vive en `../frondend`.
