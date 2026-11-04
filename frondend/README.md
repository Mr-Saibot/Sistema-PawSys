# Interfaz PawSys

Interfaz independiente para la API PawSys (NestJS). Usa HTML, CSS y TypeScript, sin dependencias de ejecución.

## Estructura

- `src/principal.ts`: punto de entrada.
- `src/controladores/`: eventos y navegación entre pantallas.
- `src/servicios/`: autenticación, llamadas a la API y persistencia de sesión.
- `src/componentes/`: navegación, tablas, agenda y piezas compartidas.
- `src/vistas/`: acceso y pantallas de cliente, veterinario y administración.
- `src/datos/` y `src/utilidades/`: datos de demostración y funciones auxiliares.
- `dist/`: JavaScript generado por TypeScript; no editar a mano.

## Ejecutar

Desde la raíz del workspace, la forma recomendada es:

```powershell
npm run instalar
npm run preparar:base
npm run iniciar
```

Abre `http://localhost:5500`. `npm run iniciar` compila y sirve el frontend y ejecuta el backend en otra tarea. Revisa el README de la raíz para configurar `.env` una sola vez.

El backend usa `http://localhost:3000` por defecto. Si usa otra dirección, cambia **Configuración de conexión** en el inicio de sesión. Las credenciales reales se validan con `POST /auth/login`; las tres vistas de demostración permiten revisar el diseño sin una base de datos configurada.

## Pantallas incluidas

- Inicio de sesión y vista de demostración para cliente, veterinario y administrador.
- Registro real de clientes, que crea su perfil ligado a la cuenta.
- Panel de cliente con sus mascotas, próxima cita y resumen de vacunas.
- Panel veterinario con pacientes, agenda e indicadores clínicos.
- Panel de administración con directorios de pacientes, clientes, equipo y un resumen de caja.
- Listado de pacientes con búsqueda y navegación adaptable a móvil.

## Integración y límites actuales

- El login usa el formato existente `{ correo, password }` y espera `{ user, access_token }`.
- Para veterinarios y administradores, el frontend consulta `/mascotas` y `/turnos`; administración también consulta `/clientes` y `/veterinarios`.
- Para clientes, consulta `GET /clientes/me/mascotas`, que obtiene las mascotas del usuario autenticado y solo permite el rol `CLIENTE`.
- El formulario público solo crea clientes. Las cuentas de veterinario y administrador deben ser creadas internamente.
- El token se guarda en `sessionStorage` y se envía como `Authorization: Bearer ...`.
- La agenda de citas propias todavía no tiene un endpoint autenticado; el panel de cliente informa que esos datos no están disponibles en vez de presentar citas de muestra como reales.
- Las rutas existentes solo comprueban JWT en muchos recursos, no permisos por rol. La navegación del frontend no sustituye la autorización del servidor.
- CORS queda configurado en el backend para `http://localhost:5500` por defecto. Para otro origen, establece `FRONTEND_URL` antes de iniciar la API.
- Las fotografías y tipografías se cargan desde Google Fonts y Unsplash; requieren conexión a internet.

## Cuentas de prueba locales

Con el backend configurado para una base de datos local, crea las cuentas de prueba desde `Sistema-PawSys-backend`:

```powershell
npm run crear:cuentas-prueba
```

Las tres cuentas usan la contraseña `PawSysDemo2026!`:

- Cliente: `cliente.demo@pawsys.local`
- Veterinario: `veterinario.demo@pawsys.local`
- Administrador: `admin.demo@pawsys.local`

El script agrega una mascota y un turno de ejemplo, no sobrescribe cuentas existentes y se bloquea cuando `NODE_ENV=production`. Úsalo solo con una base de datos de desarrollo.