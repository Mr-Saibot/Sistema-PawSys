# Frontend PawSys

Interfaz web responsive hecha con HTML, CSS y TypeScript, sin dependencias de ejecución.

## Desarrollo

Desde la raíz del proyecto:

```powershell
npm run instalar
npm run preparar:base
npm run iniciar
```

La aplicación se sirve en `http://localhost:5500` y consume la API en `http://localhost:3000`. Las carpetas del workspace son `backend` y `frondend`.

Para acceder desde un celular, configura en `backend/.env` el origen LAN en `FRONTEND_URL` y guarda en el inicio de sesión la dirección de API que use la IP local de la computadora. Consulta el [README principal](../README.md) para los pasos y el firewall.

## Pantallas conectadas

- Inicio de sesión, registro de clientes y vistas de demostración.
- Cliente: alta y edición de sus mascotas, solicitudes, cancelación/reprogramación de turnos e instrucciones de pago por QR o efectivo.
- Veterinario: pacientes, agenda, edición de turnos e historias clínicas, consultas y vacunaciones.
- Administración: altas y edición de pacientes, clientes, equipo y administradores; agendas, turnos, historias clínicas, consultas, vacunaciones y caja.

Las bajas de cuentas de personas desactivan el acceso y conservan sus datos clínicos/financieros. La eliminación de registros clínicos está limitada a administración; el backend puede rechazar una baja si hay movimientos relacionados. Ingresos y egresos admiten registro y consulta porque la API no ofrece rutas para editarlos o eliminarlos.

Los formularios requieren una sesión real, salvo el registro público y el modo de demostración. Las operaciones y permisos se validan en el backend.

## QR

La interfaz muestra la imagen configurada en `PAYMENT_QR_IMAGE_URL`, junto con el alias/titular. La imagen QR real debe ser provista por la veterinaria; el sistema no inventa el código ni verifica pagos bancarios. Los ingresos por transferencia se registran manualmente luego de la comprobación en la cuenta.

`dist/` es generado por TypeScript; no se edita manualmente.
