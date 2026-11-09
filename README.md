# PawSys

Sistema de gestión para una clínica veterinaria. Reúne una API REST, una interfaz web adaptable a escritorio y celulares, y una base de datos relacional para organizar pacientes, turnos, atención clínica y caja.

## Alcance del sistema

- **Cuentas y perfiles:** acceso con correo y contraseña, registro público de clientes y creación de personal por administración.
- **Mascotas:** datos del paciente, responsable, especie, peso, fecha de nacimiento y observaciones.
- **Turnos y agendas:** solicitud, consulta, cancelación y reprogramación de turnos, con veterinarios disponibles para seleccionar.
- **Atención veterinaria:** historias clínicas, consultas y vacunaciones relacionadas con las mascotas.
- **Administración:** gestión de clientes, veterinarios, administradores y agendas.
- **Caja:** apertura/cierre y reporte diario, registro de ingresos y egresos.
- **Pagos:** efectivo y transferencia/QR con instrucciones de la veterinaria. La transferencia se verifica manualmente; PawSys no procesa pagos ni confirma depósitos.

## Arquitectura

| Componente | Tecnología | Ubicación |
|---|---|---|
| API y reglas de negocio | NestJS, TypeScript, JWT y Prisma | [`backend/`](./backend/README.md) |
| Persistencia | MySQL, con modelos descritos en Prisma | `backend/schema.prisma` |
| Interfaz responsive | HTML, CSS y TypeScript compilado | [`frondend/`](./frondend/README.md) |
| Inicio local conjunto | Node.js | `herramientas/iniciar-desarrollo.mjs` |

El frontend consume la API REST mediante `fetch`. Las rutas protegidas requieren un token JWT y el backend aplica la validación y autorización por rol. La interfaz no reemplaza esos controles.

## Requisitos

- Node.js y npm.
- MySQL y una base de datos llamada `PawSys`.
- Python disponible en `PATH` para servir los archivos del frontend durante el desarrollo.

## Instalación y configuración

Desde la raíz del proyecto, en PowerShell:

```powershell
npm run instalar
Copy-Item .\backend\.env.example .\backend\.env
notepad .\backend\.env
```

Configura `DATABASE_URL` con las credenciales locales de MySQL, reemplaza `JWT_SECRET` por un valor aleatorio largo y revisa `PORT`, `FRONTEND_URL` y las opciones de pago. No compartas ni subas `backend/.env`.

Si la base todavía no existe, créala desde MySQL:

```sql
CREATE DATABASE PawSys;
```

Genera el cliente Prisma:

```powershell
npm run preparar:base
```

`npm run sincronizar:base` ejecuta `prisma db push`. Úsalo solo para una base nueva o después de respaldar y revisar el cambio de esquema; no lo ejecutes a ciegas sobre una base que ya contiene datos.

## Ejecución

```powershell
npm run iniciar
```

La API queda en `http://localhost:3000` y el frontend en `http://localhost:5500`. El iniciador compila el frontend e inicia ambos procesos. Para detenerlos, usa `Ctrl+C`.

Comprobaciones disponibles:

```powershell
npm run compilar
npm --prefix backend run lint
$env:NODE_OPTIONS='--experimental-vm-modules'
npm --prefix backend test -- --runInBand
```

El último comando configura la ejecución de Jest en el entorno ESM usado por las pruebas actuales.

## Uso y roles

- **Cliente:** se registra desde la pantalla de acceso; gestiona sus mascotas, solicita y administra sus turnos, y consulta instrucciones de pago.
- **Veterinario:** consulta pacientes y agenda asignada, y registra información clínica.
- **Administrador:** gestiona datos generales, personal, agendas, turnos y caja.

El registro abierto crea cuentas de cliente, no de personal. Las cuentas de veterinarios y administradores las crea un administrador autenticado. La provisión del primer administrador es una operación inicial de la instalación y no existe un registro público para ese rol.

## Acceso desde un celular en la misma red

1. Añade a `FRONTEND_URL` en `backend/.env` el origen LAN desde el que se abrirá la web, además del origen local. Sepáralos por coma, por ejemplo: `http://localhost:5500,http://192.168.1.25:5500`.
2. En **Configuración de conexión** del inicio de sesión, guarda la URL de API con la IP de la computadora, por ejemplo `http://192.168.1.25:3000`.
3. Usa **Probar conexión** para comprobar la ruta de salud de la API.
4. Conecta ambos dispositivos a la misma red y permite los puertos de desarrollo en el firewall si es necesario.

No expongas estos puertos directamente a Internet.

## Configuración de pagos

Para mostrar los datos reales de la veterinaria:

1. Coloca la imagen QR proporcionada por el banco en `frondend/qr-veterinaria.png` (o utiliza una URL pública accesible).
2. Configura `PAYMENT_QR_IMAGE_URL`, `PAYMENT_ALIAS` y `PAYMENT_HOLDER` en `backend/.env`.
3. Reinicia la API y verifica la información en **Pagos** o **Caja**.

El QR solo muestra instrucciones. El personal debe confirmar la transferencia en la cuenta bancaria antes de registrarla como ingreso. PawSys no almacena datos de tarjetas ni ofrece una pasarela de pago.

## Límites funcionales actuales

- Ingresos y egresos se pueden registrar y consultar; no hay rutas de edición o eliminación para esos movimientos.
- La eliminación lógica de personas conserva la relación de sus registros históricos.
- La disponibilidad de agenda y las operaciones permitidas dependen de las validaciones del backend.
- No se incluye confirmación automática de transferencias, recuperación de contraseñas ni un proveedor de pagos.

Para detalle de endpoints, configuración y responsabilidades del servidor, consulta [`backend/README.md`](./backend/README.md). Para pantallas, estructura y conexión, consulta [`frondend/README.md`](./frondend/README.md).
