# Backend de PawSys

API REST de gestión veterinaria construida con NestJS y TypeScript. Prisma implementa el acceso a MySQL; JWT autentica las rutas privadas y los servicios aplican reglas de negocio por rol.

## Organización

El código de `src/` está dividido en módulos de dominio:

| Módulo | Responsabilidad |
|---|---|
| `auth` | Registro de clientes, autenticación y creación de cuentas de personal |
| `clientes`, `veterinarios`, `administradores` | Perfiles y operaciones sobre personas |
| `mascotas` | Pacientes y relación con sus responsables |
| `agendas`, `turnos` | Disponibilidad y solicitudes de atención |
| `historiales-clinicos`, `consultas`, `vacunaciones` | Registros de atención |
| `caja`, `ingresos`, `egresos` | Operaciones de caja y movimientos financieros |
| `prisma` | Cliente de base de datos compartido |

El esquema está en `schema.prisma`. Los DTOs validan las entradas; la configuración global elimina propiedades desconocidas, convierte los tipos compatibles y rechaza campos no declarados.

## Requisitos y configuración

Se necesita Node.js, npm y MySQL. Crea `backend/.env` a partir de `.env.example` y define:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión MySQL, incluido usuario, contraseña, host, puerto y base |
| `JWT_SECRET` | Secreto largo y aleatorio para firmar tokens; reemplaza el valor de ejemplo |
| `PORT` | Puerto de la API (por defecto, `3000`) |
| `FRONTEND_URL` | Uno o más orígenes permitidos por CORS, separados por coma |
| `PAYMENT_ALIAS` | Alias de transferencia que se mostrará en la interfaz |
| `PAYMENT_HOLDER` | Titular de la cuenta receptora |
| `PAYMENT_QR_IMAGE_URL` | URL o ruta pública de la imagen QR |

No subas `.env` al repositorio ni uses el secreto de ejemplo. La configuración de pagos no debe incluir credenciales bancarias privadas.

Prepara el cliente y la base según el entorno:

```powershell
npm run preparar:base
npm run sincronizar:base
```

`preparar:base` genera el cliente Prisma. `sincronizar:base` aplica el esquema a la base; respalda los datos y revisa el cambio antes de ejecutarlo en una base existente.

## Ejecución y calidad

Desde `backend/`:

```powershell
npm run start:dev
npm run build
npm run lint
$env:NODE_OPTIONS='--experimental-vm-modules'
npm test -- --runInBand
```

La ruta `GET /` responde `PawSys API activa` y sirve como comprobación básica de conectividad. El README de la raíz documenta el inicio conjunto de frontend y API.

## API REST

No se configura un prefijo global `/api`. Las rutas privadas requieren `Authorization: Bearer <token>`.

| Recurso | Rutas |
|---|---|
| Salud | `GET /` |
| Autenticación | `POST /auth/register`, `POST /auth/login` |
| Cuentas de personal | `POST /auth/usuarios` |
| Clientes | `GET/POST /clientes`, `GET/PATCH/DELETE /clientes/:id`, `GET /clientes/me/mascotas` |
| Veterinarios | `GET/POST /veterinarios`, `GET/PATCH/DELETE /veterinarios/:id`, `GET /veterinarios/disponibles` |
| Administradores | `GET/POST /administradores`, `GET/PATCH/DELETE /administradores/:id` |
| Mascotas | `GET/POST /mascotas`, `GET/PATCH/DELETE /mascotas/:id` |
| Agendas | `GET/POST /agendas`, `GET/PATCH/DELETE /agendas/:id` |
| Turnos | `GET/POST /turnos`, `GET/PATCH/DELETE /turnos/:id`, `PATCH /turnos/:id/cancelar`, `PATCH /turnos/:id/reprogramar` |
| Historias clínicas | `GET/POST /historiales-clinicos`, `GET/PATCH/DELETE /historiales-clinicos/:id`, `GET /historiales-clinicos/mascota/:mascotaId` |
| Consultas | `GET/POST /consultas`, `GET/PATCH/DELETE /consultas/:id` |
| Vacunaciones | `GET/POST /vacunaciones`, `GET/PATCH/DELETE /vacunaciones/:id` |
| Caja | `GET /caja`, `POST /caja/abrir`, `POST /caja/:id/cerrar`, `GET /caja/:id/reporte-diario?fecha=YYYY-MM-DD` |
| Ingresos | `GET/POST /ingresos`, `POST /ingresos/consultas/:id`, `POST /ingresos/vacunaciones/:id` |
| Egresos | `GET/POST /egresos` |
| Pagos públicos | `GET /configuracion/pagos` |

Las rutas para perfiles (`POST /clientes`, `/veterinarios` y `/administradores`) están protegidas; la interfaz usa flujos de alta de cuenta vinculados para evitar crear perfiles sin usuario. Clientes se registran mediante `POST /auth/register`; administradores autenticados crean personal mediante `POST /auth/usuarios`.

## Autenticación y permisos

- El registro público crea únicamente cuentas con rol `CLIENTE`.
- `POST /auth/usuarios` permite que administración cree cuentas de `VETERINARIO` o `ADMINISTRADOR`.
- Clientes acceden a sus mascotas y turnos, no a los datos generales de otros clientes.
- Veterinarios trabajan con las atenciones y turnos que les corresponden según las reglas del servicio.
- Administración gestiona la información general, el personal y las operaciones de caja.
- Ingresos, egresos y acciones de caja son exclusivos de administración.
- `GET /veterinarios/disponibles` devuelve datos mínimos para elegir un profesional. `GET /configuracion/pagos` devuelve instrucciones públicas, nunca secretos.
- Al crear una mascota se crea también su historia clínica en la misma operación.
- Registrar una consulta o vacunación no altera la caja. Administración registra el cobro confirmado mediante `POST /ingresos/consultas/:id` o `POST /ingresos/vacunaciones/:id`, enviando `{ "cajaId": 1, "formaPago": "EFECTIVO" }` o `TRANSFERENCIA_QR`. El monto se toma del costo clínico, se vincula al registro y no se puede cobrar dos veces.
- Los reportes filtran movimientos por día calendario de Paraguay (`America/Asuncion`). Si se omite `fecha`, se usa el día actual; si se envía, debe respetar `YYYY-MM-DD`.
- Los egresos se rechazan cuando la caja no está abierta o su saldo disponible no alcanza.

Las bajas de personas desactivan la cuenta o conservan referencias históricas según el servicio. Los movimientos financieros no tienen operaciones de edición/borrado. Una atención con cobro no se puede eliminar ni cambiar de costo, para conservar el registro contable. Las escrituras de caja y movimientos relacionados usan transacciones para mantener coherentes los saldos.

## Pruebas

Se mantienen pruebas de reglas de negocio para clientes y conflictos de turnos en `src/clientes/clientes.service.spec.ts` y `src/turnos/turnos.service.spec.ts`. Las pruebas de plantilla del generador Nest se retiraron para no confundirlas con cobertura funcional.

Para instrucciones del producto y configuración local completa, consulta el [README principal](../README.md).
