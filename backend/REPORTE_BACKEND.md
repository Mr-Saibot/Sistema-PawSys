# Reporte de análisis del backend PawSys

**Fecha de revisión:** 14 de octubre de 2026  
**Alcance:** revisión estática del código y de la configuración disponible en este repositorio.

## Resumen ejecutivo

Este repositorio contiene el **backend de una API REST** para un sistema veterinario. Está desarrollado con **NestJS y TypeScript**, usa **Prisma ORM** y el esquema declara una base de datos **MySQL**. La autenticación está planteada con JWT y contraseñas con bcrypt.

**Next.js no está instalado ni configurado en este repositorio.** Next.js podría elegirse para construir el frontend en otro proyecto, pero no es una tecnología confirmada por este backend. TypeScript sí se usa aquí.

Hay controladores y operaciones CRUD para usuarios/perfiles, mascotas, agenda, turnos, historias clínicas, consultas, vacunaciones y caja. Sin embargo, no se pudo comprobar su ejecución: faltan dependencias instaladas en el entorno revisado, no se encontró un archivo de entorno de ejemplo ni configuración de base de datos y el build no pudo arrancar. Por eso, las rutas descritas abajo son **rutas declaradas en el código**, no una garantía de que ya estén operativas en un entorno.

## Tecnologías comprobadas

| Tecnología | Evidencia/uso |
|---|---|
| TypeScript | Código fuente bajo `src/`; compilación configurada con Nest CLI. |
| NestJS | Aplicación modular; dependencias `@nestjs/*`; comandos `nest`. |
| Prisma | `schema.prisma` y `PrismaService` extiende `PrismaClient`. |
| MySQL | `datasource` de Prisma con `provider = "mysql"`. |
| JWT / Passport | Login emite token y `JwtAuthGuard` protege rutas. |
| bcrypt | Hash y comparación de contraseñas. |
| Next.js | **No aparece** en `package.json` ni en la estructura revisada. |

Las versiones principales declaradas incluyen NestJS 12, Prisma y `@prisma/client` 5.18, y TypeScript 6. El cliente Prisma está declarado en `devDependencies`; eso debe revisarse antes de desplegar con instalaciones de producción que omitan dependencias de desarrollo.

## Estructura del proyecto

- `src/main.ts`: crea la aplicación NestJS y escucha en `PORT` o, por defecto, en el puerto `3000`.
- `src/app.module.ts`: módulo raíz que registra Prisma y los módulos de cada dominio.
- `src/auth/`: registro, login, estrategia/guard JWT y autorización por roles.
- `src/prisma/`: servicio compartido de Prisma y conexión al iniciar el módulo.
- `src/clientes/`, `src/veterinarios/`, `src/administradores/`: perfiles de usuario.
- `src/mascotas/`, `src/agendas/`, `src/turnos/`: mascotas y gestión de citas.
- `src/historiales-clinicos/`, `src/consultas/`, `src/vacunaciones/`: atención médica.
- `src/caja/`, `src/ingresos/`, `src/egresos/`: operaciones financieras.
- En la mayoría de módulos, `*.controller.ts` define las rutas, `*.service.ts` contiene operaciones y consultas a Prisma, y `dto/` define los datos de entrada.
- `schema.prisma`: modelos, relaciones y enums de la base de datos.
- `jest.config.ts`, archivos `*.spec.ts` y scripts npm: configuración prevista de pruebas. El README original es todavía el README genérico de NestJS.

## Modelo de datos

El esquema define estos modelos: `Usuario`, `Cliente`, `Veterinario`, `Administrador`, `Mascota`, `Agenda`, `Turno`, `HistorialClinico`, `Consulta`, `Vacunacion`, `Caja`, `Ingreso` y `Egreso`. `Rol` admite `CLIENTE`, `VETERINARIO` y `ADMINISTRADOR`.

Relaciones principales:

- Un usuario puede tener un perfil de cliente, veterinario o administrador; cada perfil apunta a un usuario.
- Un cliente puede tener varias mascotas. Una mascota puede tener un historial clínico y varios turnos.
- Una historia clínica agrupa consultas y vacunaciones, asociadas a un veterinario.
- Una agenda puede agrupar turnos; cada turno enlaza mascota y veterinario.
- Una caja pertenece a un administrador y agrupa ingresos y egresos.
- Un ingreso puede enlazarse opcionalmente con una consulta o vacunación.

## Rutas declaradas

No hay prefijo global configurado: las rutas se consumen desde la raíz, por ejemplo `/clientes`, no `/api/clientes`. Los parámetros `:id` se esperan como números en los controladores que aplican `ParseIntPipe`.

### Acceso público

| Método | Ruta | Función declarada |
|---|---|---|
| `GET` | `/` | Ruta inicial; devuelve el mensaje de bienvenida de NestJS. |
| `POST` | `/auth/register` | Registra una cuenta de usuario. |
| `POST` | `/auth/login` | Verifica credenciales y devuelve usuario y `access_token`. |

### Rutas que requieren JWT

El token se envía como `Authorization: Bearer <token>`. Las rutas siguientes usan `JwtAuthGuard`, salvo las de ingresos y egresos, que además requieren rol `ADMINISTRADOR`.

| Recurso | Rutas declaradas |
|---|---|
| Clientes | `POST /clientes`; `GET /clientes`; `GET /clientes/:id`; `PATCH /clientes/:id`; `DELETE /clientes/:id` |
| Veterinarios | `POST /veterinarios`; `GET /veterinarios`; `GET /veterinarios/:id`; `PATCH /veterinarios/:id`; `DELETE /veterinarios/:id` |
| Administradores | `POST /administradores`; `GET /administradores`; `GET /administradores/:id`; `PATCH /administradores/:id`; `DELETE /administradores/:id` |
| Mascotas | `POST /mascotas`; `GET /mascotas`; `GET /mascotas/:id`; `PATCH /mascotas/:id`; `DELETE /mascotas/:id` |
| Agendas | `POST /agendas`; `GET /agendas`; `GET /agendas/:id`; `PATCH /agendas/:id`; `DELETE /agendas/:id` |
| Turnos | `POST /turnos`; `GET /turnos`; `GET /turnos/:id`; `PATCH /turnos/:id`; `PATCH /turnos/:id/cancelar`; `PATCH /turnos/:id/reprogramar`; `DELETE /turnos/:id` |
| Historias clínicas | `POST /historiales-clinicos`; `GET /historiales-clinicos`; `GET /historiales-clinicos/:id`; `GET /historiales-clinicos/mascota/:mascotaId`; `PATCH /historiales-clinicos/:id`; `DELETE /historiales-clinicos/:id` |
| Consultas | `POST /consultas`; `GET /consultas`; `GET /consultas/:id`; `PATCH /consultas/:id`; `DELETE /consultas/:id` |
| Vacunaciones | `POST /vacunaciones`; `GET /vacunaciones`; `GET /vacunaciones/:id`; `PATCH /vacunaciones/:id`; `DELETE /vacunaciones/:id` |
| Caja | `POST /caja/abrir`; `POST /caja/:id/cerrar`; `GET /caja/:id/reporte-diario`; `GET /caja` |
| Ingresos (solo administrador) | `POST /ingresos`; `GET /ingresos` |
| Egresos (solo administrador) | `POST /egresos`; `GET /egresos` |

## ¿Funcionan las rutas?

La respuesta precisa con la evidencia disponible es: **están implementadas a nivel de controlador/servicio, pero su funcionamiento real no está verificado**. La compilación intentada con `npm run build` falló porque el comando `nest` no está disponible (`nest no se reconoce`), lo que indica que las dependencias no están instaladas o no están accesibles en este entorno. Tampoco se pudo verificar una conexión a MySQL.

Las pruebas detectadas son principalmente pruebas de que ciertos servicios/controladores se construyen (`should be defined`), no pruebas de login, CRUD, roles, reglas de negocio o integración con la base de datos. El script `test:e2e` referencia `test/jest-e2e.json`, pero ese archivo no se pudo abrir en la revisión. Por tanto, no hay evidencia suficiente para marcar una ruta como probada de extremo a extremo.

| Área | Estado según el código | Verificación pendiente |
|---|---|---|
| NestJS y TypeScript | Configurados en el proyecto. | Instalar dependencias y compilar. |
| Prisma y MySQL | Esquema y cliente declarados. | Configurar `DATABASE_URL`, generar cliente y aplicar esquema/migraciones a una base disponible. |
| Registro/login | Implementación con bcrypt y JWT. | Probar contra DB; revisar el alta pública de roles. |
| CRUD de dominios | Controladores y servicios presentes. | Probar cada operación con datos válidos e inválidos y revisar errores de Prisma. |
| CORS / consumo desde navegador | No se habilita en `main.ts`. | Configurar origen del frontend antes de llamar desde Next.js en otro puerto/dominio. |
| Validación de DTO | Hay decoradores en algunos DTOs. | No se registra `ValidationPipe` global; las reglas `class-validator` no se aplican automáticamente. |

## Hallazgos importantes antes de construir el frontend

1. **El registro permite elegir rol.** `POST /auth/register` acepta `rol` desde el cuerpo y es público. Como no hay aprobación ni restricción visible, un usuario podría intentar registrarse como `ADMINISTRADOR`; ese rol habilita ingresos y egresos. Debe corregirse en el backend antes de confiar en los roles desde la interfaz.
2. **El registro solo crea `Usuario`.** No crea un perfil de `Cliente`, `Veterinario` o `Administrador`. Para completar la relación, hay operaciones separadas de perfiles que requieren JWT; el flujo de alta de usuario/perfil debe acordarse antes de diseñar el registro del frontend.
3. **La mayoría de los recursos solo exige estar autenticado.** Clientes, mascotas, historias, consultas, turnos, etc. no restringen operaciones por rol ni por propietario. Ocultar botones en el frontend no sustituye autorización en el servidor.
4. **No hay validación global ni CORS visible.** Añadir `ValidationPipe` en `main.ts` haría efectivas las validaciones declaradas; configurar CORS permitiría las llamadas del navegador desde el origen del frontend.
5. **Secreto JWT de respaldo hardcodeado.** Si no se establece `JWT_SECRET`, tanto la emisión como la verificación usan un valor fijo incluido en el código. En cualquier despliegue debe usarse un secreto externo, fuerte y obligatorio.
6. **Caja y movimientos:** ingresos/egresos se insertan sin actualizar `saldoActual`; el saldo final se recalcula al cerrar la caja. Tampoco se ve una transacción que agrupe el cierre, ni una restricción de base de datos que impida dos aperturas concurrentes.
7. **DTOs inconsistentes:** algunos usan decoradores de `class-validator`, pero otros (por ejemplo turnos, agendas e ingresos/egresos) no los tienen. Sin `ValidationPipe`, el servidor depende en gran medida de que Prisma rechace datos incorrectos.
8. **Falta configuración para levantar el proyecto de forma reproducible:** no se encontró `.env.example`, carpeta de migraciones/seed ni scripts npm para generar/aplicar el esquema. `.env` está ignorado por Git, como corresponde, pero hace falta documentar las variables requeridas.
9. **Dependencia de producción:** `@prisma/client` aparece en `devDependencies`; confirmar su ubicación antes de instalar solo dependencias de producción.
10. **Listados sin paginación o filtros visibles:** los `findMany` revisados devuelven listas completas, lo cual puede afectar el rendimiento y la interfaz cuando crezcan los datos.

## Guía inicial para integrar un frontend Next.js

- Se puede crear un frontend separado con **Next.js + TypeScript**; no hace falta convertir este backend a Next.js.
- En desarrollo, la URL base prevista es `http://localhost:3000`, salvo que se defina otro `PORT`. No hay prefijo `/api` configurado.
- El frontend debe guardar y enviar el JWT en el encabezado `Authorization: Bearer <token>` para las rutas protegidas. Acordar almacenamiento seguro y expiración con el equipo; el token dura 8 horas según la configuración actual.
- La respuesta de login tiene esta forma general: `{ user, access_token }`. En registro se devuelve el usuario sin `passwordHash`, pero no se devuelve token.
- Fechas se envían como strings compatibles con fecha ISO en operaciones que las usan. Los campos monetarios usan `Decimal` en Prisma; comprobar cómo se serializan en JSON antes de tipar las respuestas del frontend.
- Antes de integrar pantallas, conviene acordar contratos de request/response, mensajes de error, permisos por rol, flujo de creación de perfiles, paginación y política de CORS.

## Archivos principales para continuar la revisión

- Arranque y módulos: `src/main.ts`, `src/app.module.ts`.
- Autenticación y autorización: `src/auth/auth.controller.ts`, `src/auth/auth.service.ts`, `src/auth/jwt.strategy.ts`, `src/auth/roles.guard.ts`.
- Modelo y conexión: `schema.prisma`, `src/prisma/prisma.service.ts`.
- Configuración de paquetes: `package.json`, `tsconfig.json`.
