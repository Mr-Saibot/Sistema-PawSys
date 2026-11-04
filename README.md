# PawSys

Sistema de gestión veterinaria con API NestJS/Prisma/MySQL y una interfaz responsive de HTML, CSS y TypeScript.

## Requisitos

- Node.js y npm.
- Python, para servir el frontend.
- MySQL con una base de datos llamada `PawSys`.

## Preparación inicial

Instala las dependencias desde la raíz del proyecto:

```powershell
npm run instalar
```

Crea tu archivo local de configuración y edítalo una sola vez con el usuario y contraseña de MySQL:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
notepad .\backend\.env
```

Genera el cliente Prisma:

```powershell
npm run preparar:base
```

La base `PawSys` debe existir en MySQL. Puedes crearla una vez desde Workbench o phpMyAdmin:

```sql
CREATE DATABASE PawSys;
```

El archivo `.env` es local e ignorado por Git. La base `PawSys` de tu entorno ya tiene tablas y relaciones, así que no ejecutes `db push` sobre ella: las claves foráneas ya existen.

Para una base completamente nueva y vacía, el comando explícito para crear el esquema es `npm run sincronizar:base`. No lo uses sobre una base con datos sin antes hacer un respaldo y revisar el diff de Prisma.

## Iniciar ambos proyectos

Desde la raíz:

```powershell
npm run iniciar
```

La API queda en `http://localhost:3000` y la interfaz en `http://localhost:5500`. El iniciador compila y sirve el frontend y levanta el backend. Para apagar ambos, presiona `Ctrl+C`.

Si cambias el esquema de Prisma, vuelve a ejecutar `npm run preparar:base`. Si cambias TypeScript del frontend mientras está activo, vuelve a ejecutar `npm --prefix frondend run build`.

## Acceso desde un celular en la misma red

1. Configura `FRONTEND_URL` en `backend/.env` con el origen del frontend en la computadora y el origen LAN que usará el celular, separados por coma. Ejemplo: `http://localhost:5500,http://192.168.1.25:5500`.
2. En **Configuración de conexión** del inicio de sesión, guarda la dirección de la API usando la IP LAN de la computadora, por ejemplo `http://192.168.1.25:3000`.
3. Permite los puertos 3000 y 5500 en el firewall de desarrollo si Windows los bloquea.

El celular y la computadora deben estar conectados a la misma red. No expongas estos puertos directamente a Internet.

## Caja y pagos

La caja permite registrar ingresos en efectivo y transferencias/QR, además de egresos. **El QR no confirma una transferencia:** el personal debe verificar el pago en la cuenta bancaria antes de registrarlo como ingreso.

Para mostrar el QR real de la veterinaria:

- Copia la imagen QR provista por el banco a `frondend/qr-veterinaria.png`.
- Configura `PAYMENT_QR_IMAGE_URL="/qr-veterinaria.png"`, `PAYMENT_ALIAS` y `PAYMENT_HOLDER` en `backend/.env`.
- Reinicia el backend. El cliente verá las instrucciones en **Pagos** y el administrador podrá ver el QR desde **Caja**.

PawSys no almacena datos de tarjetas ni verifica transferencias automáticamente.

## Roles

- **Cliente:** consulta y edita sus mascotas, solicita/cancela/reprograma turnos y ve las instrucciones de pago.
- **Veterinario:** consulta pacientes y su agenda, registra historias clínicas, consultas y vacunaciones.
- **Administrador:** gestiona pacientes, clientes, equipo y administradores; edita agendas/turnos y administra historias clínicas, caja, ingresos y egresos.

En las pantallas de gestión se pueden editar los registros para los que la API expone `PATCH`. Las bajas de clientes y personal desactivan su cuenta para conservar el historial; la baja de mascotas también es lógica. Ingresos y egresos solo permiten alta y consulta, ya que el backend no expone rutas para editarlos o eliminarlos.

El backend aplica los permisos; ocultar pantallas en el frontend no se considera autorización.