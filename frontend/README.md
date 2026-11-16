# Frontend de PawSys

Interfaz responsive para escritorio, tablet y celular. La entrada principal
usa React, TypeScript, Tailwind y Vite; conserva los servicios HTTP y las
reglas de autorización del backend.

## Estructura principal

| Ruta | Función |
|---|---|
| `index.html` | Entrada de la aplicación completa |
| `ficha.html` | Entrada directa a la ficha clínica |
| `src/aplicacion/App.tsx` | Rutas y acceso por rol |
| `src/aplicacion/componentes/` | Navegación, formularios y elementos visuales |
| `src/aplicacion/hooks/` | Sesión, carga de datos y lógica de pantallas |
| `src/aplicacion/paginas/` | Vistas de cada módulo |
| `src/servicios/api.ts` | Comunicación con la API y autorización administrativa |
| `src/tipos.ts` | Tipos de datos usados por la aplicación |
| `tailwind.config.cjs` | Tokens visuales |
| `DESIGN.md` | Guía del diseño y alcance de las pantallas |

## Ejecutar y compilar

Desde la raíz del proyecto:

```powershell
npm run instalar
npm run preparar:base
npm run iniciar
```

La API queda en `http://localhost:3000` y la aplicación web en
`http://localhost:5500`. La base de datos debe estar configurada en
`backend/.env` antes de iniciar la API.

Para compilar solo el frontend:

```powershell
npm --prefix frontend run build
```

La URL de la API se puede cambiar desde **Configuración de conexión** en el
acceso. La API debe permitir el origen web en `FRONTEND_URL`. Para probar
desde un celular de la misma red, revisá la sección de red local del
[README principal](../README.md).

## Pantallas y permisos

- **Cliente:** inicio, mascotas propias, agenda para reservar horarios,
  ficha e historial clínico de sus mascotas, y datos de pago.
- **Veterinario:** agenda, pacientes, historias clínicas y cobros de sus
  atenciones.
- **Administrador:** gestión de propietarios, equipo, administradores,
  pacientes y agendas; además de caja y pagos.

La aplicación presenta los módulos que existen en la API. Inventario y
facturación completa todavía no están implementados en el backend, por lo
que no se muestran como operaciones disponibles. La caja registra y consulta
ingresos/egresos; los cobros de consultas y vacunaciones se vinculan a sus
atenciones. La transferencia o QR se verifica manualmente.

Las rutas de la interfaz mejoran la navegación, pero no son una medida de
seguridad. El backend sigue validando el token, el rol, la propiedad de los
datos y las operaciones permitidas. Las modificaciones administrativas
solicitan el PIN a través del servicio HTTP existente.

## Estados y diseño

Las pantallas usan los tokens definidos en `tailwind.config.cjs`. Los
listados muestran búsqueda/filtros cuando corresponde, estados vacíos,
mensajes de error y estados de carga. Los formularios de alta y edición se
abren en paneles laterales para mantener el contexto de la vista.

La mascota se destaca en las tarjetas y la ficha. Las historias se
presentan como una línea de tiempo. Los datos no almacenados por la API,
como desparasitación o documentos, no se inventan ni se simulan.

## Pagos

El QR, alias y titular se cargan desde la configuración pública de pagos
del backend. La veterinaria debe proporcionar el QR real. El personal
confirma una transferencia desde Caja solo después de verificarla en la
cuenta bancaria; PawSys no procesa tarjetas ni confirma depósitos.
