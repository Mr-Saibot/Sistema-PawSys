# Frontend de PawSys

Interfaz web responsive para las operaciones de la clínica. Está desarrollada en HTML, CSS y TypeScript, sin framework ni dependencias JavaScript de ejecución. La carpeta se llama `frondend` en el repositorio.

## Estructura

| Ruta | Función |
|---|---|
| `index.html` | Documento de entrada |
| `styles.css` | Diseño adaptable, componentes y estados de pantalla |
| `src/controladores/` | Eventos de usuario, navegación y coordinación de operaciones |
| `src/vistas/` | Pantallas de acceso, cliente, veterinario y administración |
| `src/componentes/` | Marco de navegación, tablas, formularios y detalles reutilizables |
| `src/servicios/api.ts` | Comunicación HTTP con la API y carga de datos |
| `src/servicios/sesion.ts` | Persistencia local de la sesión |
| `src/tipos.ts` | Tipos de datos que consume la interfaz |
| `dist/` | Salida generada por TypeScript; no se edita manualmente |

## Compilación y ejecución

Desde la raíz del proyecto:

```powershell
npm run instalar
npm run preparar:base
npm run iniciar
```

El servidor web local usa `http://localhost:5500`; la API por defecto está en `http://localhost:3000`. Para compilar solo esta parte:

```powershell
npm --prefix frondend run build
```

La URL de API se puede cambiar en **Configuración de conexión** antes de iniciar sesión. **Probar conexión** consulta `GET /` y muestra la respuesta de salud. La API debe permitir el origen del frontend en `FRONTEND_URL`.

## Pantallas y operaciones

- **Acceso:** inicio de sesión, registro público de clientes y configuración de la API. No hay cuentas demo ni acceso simulado.
- **Cliente:** alta y edición de mascotas propias, solicitud/cancelación/reprogramación de turnos, selección de veterinario disponible y consulta de instrucciones de pago.
- **Veterinario:** consulta de pacientes y turnos, además de registro y mantenimiento de información clínica permitido por el backend.
- **Administración:** gestión de clientes, mascotas, equipo, agendas, turnos, historias clínicas, consultas, vacunaciones y caja.
- **Detalle de registros:** las pantallas con rutas de lectura por identificador permiten consultar el detalle desde el API.

Las operaciones que la API no expone tampoco se simulan: ingresos y egresos se registran y consultan, pero no se editan ni eliminan desde la interfaz.

## Conexión, seguridad y pagos

El cliente HTTP adjunta el token JWT en solicitudes protegidas y presenta los errores del servidor en la pantalla. Los permisos no dependen de ocultar botones: el backend es la autoridad para cada operación. La sesión se guarda localmente en el navegador; cierra sesión en dispositivos compartidos.

El QR, alias y titular se cargan desde la configuración pública de pagos del backend. La veterinaria debe proporcionar el QR real. El pago por transferencia se verifica manualmente fuera de PawSys antes de registrar el ingreso; no se procesan tarjetas ni se confirma una operación bancaria automáticamente.

Para acceso desde un celular, configura en el backend el origen LAN en CORS y coloca la URL LAN de la API en esta pantalla. Consulta la sección de red local en el [README principal](../README.md).
