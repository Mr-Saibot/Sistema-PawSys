# PawSys: inicio local

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
Copy-Item .\Sistema-PawSys-backend\.env.example .\Sistema-PawSys-backend\.env
notepad .\Sistema-PawSys-backend\.env
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

La API queda en `http://localhost:3000` y la interfaz en `http://localhost:5500`. El proceso compila el frontend antes de servirlo. Para apagar ambos, presiona `Ctrl+C`.

Si cambias el esquema de Prisma, vuelve a ejecutar `npm run preparar:base`. Si cambias TypeScript del frontend mientras está activo, vuelve a ejecutar `npm --prefix frond run build`.