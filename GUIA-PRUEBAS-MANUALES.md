# Guía de pruebas manuales de PawSys

Esta guía permite recorrer los flujos principales de PawSys con los tres roles y comprobar las rutas REST. Realiza las pruebas en una base local con datos de prueba: varias acciones crean registros y las bajas o eliminaciones pueden ser irreversibles.

## 1. Preparar el entorno

1. En la raíz del proyecto ejecuta:

   ```powershell
   npm run iniciar
   ```

2. Deja esa terminal abierta y verifica:
   - Frontend: `http://localhost:5500`
   - API: `http://localhost:3000`
   - Salud de API: `http://localhost:3000/` debe responder `PawSys API activa`.
3. En el inicio de sesión abre **Configuración de conexión**, confirma `http://localhost:3000` y pulsa **Probar conexión**.
4. Ten acceso a una cuenta de **administrador** ya existente. El sistema no tiene alta pública de administradores; la primera cuenta debe haberse provisionado previamente.
5. Si la base contiene información real, no pruebes altas, bajas ni eliminaciones allí. Usa cuentas, mascotas, turnos y horarios que puedas identificar claramente como datos de prueba.

### Cuentas que conviene preparar

- Un administrador con acceso.
- Un cliente de prueba, que se puede registrar desde **Registrarse**.
- Un veterinario de prueba, creado por el administrador desde **Equipo**.
- Opcional: un segundo cliente y un segundo veterinario para probar aislamiento de datos y conflictos de horarios.

Anota el correo y la contraseña de cada cuenta, y los identificadores de prueba que necesites. No compartas contraseñas ni tokens.

## 2. Prueba como administrador

Inicia sesión con la cuenta administrativa. Debes ver el menú de administración y no el menú de cliente.

### 2.1 Cuentas y perfiles

- [ ] En **Clientes**, crea un cliente nuevo con correo único y contraseña temporal. La interfaz crea la cuenta y el perfil asociados. Cierra sesión y prueba luego su acceso como cliente.
- [ ] Consulta el directorio, abre **Ver detalle**, edita sus datos y guarda.
- [ ] Desactiva solo un cliente creado para esta prueba. Comprueba que deja de poder iniciar sesión y que sus datos históricos no se usan como si fueran un registro nuevo.
- [ ] En **Equipo**, crea un veterinario con correo único, contraseña temporal y datos profesionales. La creación del usuario y su perfil se realiza en una sola operación.
- [ ] Consulta el equipo, abre su detalle, edita y guarda. No desactives la cuenta que utilizarás en la siguiente sección.
- [ ] En **Administradores**, crea una cuenta administrativa adicional de prueba; consulta, abre detalle, edita y, si no es la cuenta actual, desactívala al final.

### 2.2 Mascotas y horarios

- [ ] En **Pacientes**, registra una mascota vinculada al cliente de prueba. Confirma que el responsable mostrado corresponde al seleccionado.
- [ ] Abre el detalle de la mascota, edita un campo y guarda.
- [ ] Crea una agenda para una fecha futura y una hora disponible.
- [ ] Abre el detalle del horario, edita fecha u hora y guarda.
- [ ] Si no hay turnos relacionados, elimina el horario de prueba. Una agenda relacionada puede no poder eliminarse.

### 2.3 Turnos

- [ ] Registra un turno de prueba para la mascota y el veterinario de prueba, en una fecha futura.
- [ ] Comprueba que aparece en **Agenda**; abre su detalle.
- [ ] Edita un dato del turno y guarda.
- [ ] Prueba **Reprogramar** con otra fecha y hora futura.
- [ ] Prueba **Cancelar** y confirma que el turno queda cancelado.
- [ ] Para probar la eliminación definitiva de un turno, usa únicamente el endpoint administrativo `DELETE /turnos/:id` de la tabla de API. La cancelación es preferible para conservar el historial.
- [ ] Opcional: intenta reservar el mismo horario para el mismo veterinario dos veces; la segunda solicitud debe ser rechazada por conflicto.

### 2.4 Atención clínica

- [ ] En **Historias clínicas**, crea una historia para una mascota que todavía no tenga una.
- [ ] Registra una consulta con motivo y costo; añade diagnóstico y tratamiento si corresponde.
- [ ] Registra una vacunación con vacuna y costo; añade próxima dosis si aplica.
- [ ] Abre el detalle de historia, consulta y vacunación.
- [ ] Edita observaciones de la historia, la consulta y la vacunación.
- [ ] Comprueba que el veterinario no tiene botones de eliminación. Como administrador, elimina solo registros clínicos de prueba si necesitas probar esas rutas.

### 2.5 Caja

- [ ] En **Caja**, abre una caja con un saldo inicial de prueba.
- [ ] Registra un ingreso en efectivo.
- [ ] Registra un ingreso por transferencia/QR solo si ya verificaste manualmente el pago. No uses un pago real para esta prueba.
- [ ] Registra un egreso con categoría y monto.
- [ ] Comprueba que los movimientos aparecen en la lista y que cambia el saldo.
- [ ] Abre el reporte diario y revisa los totales.
- [ ] Cierra la caja y confirma su estado. Las rutas de ingresos y egresos no permiten editar ni borrar movimientos.

## 3. Prueba como cliente

Si todavía no creaste el cliente de prueba, cierra la sesión administrativa y selecciona **Registrarse**. Registra el correo y contraseña de prueba; vuelve al acceso e inicia sesión.

- [ ] Verifica que solo aparezcan **Inicio**, **Mis mascotas**, **Mis turnos** y **Pagos**.
- [ ] Comprueba que el panel muestre solamente las mascotas y turnos del cliente conectado.
- [ ] Registra una mascota. Como cliente no debes tener que seleccionar otro responsable: PawSys la vincula a tu propia cuenta.
- [ ] Abre el detalle y edita los datos de tu mascota.
- [ ] Solicita un turno para tu mascota, selecciona el veterinario de prueba y usa una fecha futura disponible.
- [ ] Abre el detalle del turno y reprograma o cancela el turno de prueba.
- [ ] Consulta **Pagos** y comprueba que muestra el alias, titular e imagen configurados. La pantalla informa que el QR no confirma la transferencia.
- [ ] Cierra sesión. La navegación debe volver al inicio y no conservar páginas privadas.

## 4. Prueba como veterinario

Inicia sesión con el veterinario creado por administración. Si acabas de crearlo, primero cierra la sesión anterior.

- [ ] Verifica que aparecen **Inicio**, **Pacientes**, **Agenda** e **Historias clínicas**; no deben aparecer **Clientes**, **Equipo**, **Administradores** ni **Caja**.
- [ ] Consulta pacientes y sus detalles.
- [ ] Revisa que la agenda muestre solo los turnos asignados al veterinario conectado.
- [ ] Abre el detalle de un turno asignado.
- [ ] Registra o edita una historia, consulta y vacunación de prueba.
- [ ] Confirma que no puede eliminar historias clínicas, consultas o vacunaciones desde la interfaz.
- [ ] Confirma que no puede acceder a caja ni administrar cuentas.

## 5. Comprobaciones de permisos por API

La interfaz oculta las secciones que no corresponden al rol, pero la autorización real se valida en el backend. Para comprobarla directamente, usa Postman:

1. Crea variables `baseUrl` = `http://localhost:3000` y `tokenCliente`, `tokenVeterinario`, `tokenAdmin`.
2. Para obtener un token, envía `POST {{baseUrl}}/auth/login` con:

   ```json
   {
     "correo": "correo-de-prueba",
     "password": "contraseña-de-prueba"
   }
   ```

3. Copia `access_token` de la respuesta en la variable del rol correspondiente.
4. Para rutas protegidas agrega el encabezado:

   ```text
   Authorization: Bearer {{tokenAdmin}}
   ```

5. En **Authorization**, reemplaza `tokenAdmin` por el token del rol que estés probando. No pegues tokens en capturas, commits o mensajes.

Resultados generales esperados: una ruta protegida sin token responde `401`; una ruta prohibida para el rol autenticado responde `403`; una entrada inválida normalmente responde `400`; un identificador inexistente responde `404`; un turno ocupado puede responder `409`.

| Prueba | Método y ruta | Cliente | Veterinario | Administrador |
|---|---|---:|---:|---:|
| Salud, sin token | `GET /` | 200 | 200 | 200 |
| Configuración pública de pagos | `GET /configuracion/pagos` | 200 | 200 | 200 |
| Listar veterinarios disponibles | `GET /veterinarios/disponibles` | 200 | 200 | 200 |
| Listar clientes | `GET /clientes` | 403 | 200 | 200 |
| Consultar mascotas propias | `GET /clientes/me/mascotas` | 200 | 403 | 403 |
| Abrir caja | `GET /caja` | 403 | 403 | 200 |
| Listar ingresos | `GET /ingresos` | 403 | 403 | 200 |
| Listar egresos | `GET /egresos` | 403 | 403 | 200 |
| Crear cuenta de personal | `POST /auth/usuarios` | 403 | 403 | 201 |
| Crear historia clínica | `POST /historiales-clinicos` | 403 | 201 | 201 |
| Eliminar registro clínico | `DELETE /consultas/:id` | 403 | 403 | 200 |

Las respuestas de POST exitosos de NestJS normalmente usan `201`; GET, PATCH y DELETE usan `200`. Si un rol permitido recibe una respuesta distinta por reglas del registro (por ejemplo, un duplicado), anota el mensaje y valida si esa es la regla esperada.

### Aislamiento entre cuentas

Usa dos clientes y, si puedes, dos veterinarios con registros separados. Cambia `:id` por un ID de prueba:

- [ ] Cliente A: `GET /mascotas/:id` de su mascota debe responder correctamente.
- [ ] Cliente A: `GET /mascotas/:id` de Cliente B debe responder `403`.
- [ ] Cliente A: `GET /turnos/:id` de su turno debe responder correctamente.
- [ ] Cliente A: `GET /turnos/:id` de Cliente B debe responder `403`.
- [ ] Veterinario A: `GET /turnos/:id` de un turno asignado debe responder correctamente.
- [ ] Veterinario A: `GET /turnos/:id` asignado a Veterinario B debe responder `403`.
- [ ] Sin token: prueba `GET /mascotas` y `GET /turnos`; ambos deben responder `401`.

## 6. Inventario de rutas para completar la comprobación

Utiliza los registros de prueba creados en las secciones anteriores. En las rutas `:id` reemplaza el marcador por el ID real. El método permitido no implica que todos los roles puedan usarlo: aplica la columna de acceso y también las reglas de pertenencia descritas arriba.

| Grupo | Método y ruta | Acceso esperado | Operación de prueba |
|---|---|---|---|
| Salud | `GET /` | Público | Confirmar `PawSys API activa`. |
| Registro | `POST /auth/register` | Público | Registrar un cliente nuevo con correo único. |
| Inicio de sesión | `POST /auth/login` | Público | Login válido y login con contraseña incorrecta. |
| Personal | `POST /auth/usuarios` | Administrador | Crear veterinario o administrador desde **Equipo** / **Administradores**. |
| Clientes | `GET /clientes` | Veterinario, administrador | Listar y consultar desde **Clientes** (solo admin tiene esa pantalla). |
| Clientes | `POST /clientes` | Administrador | Ruta de perfil directo; para el flujo normal usa registro vinculado, no crees perfiles huérfanos. |
| Clientes | `GET /clientes/:id` | Veterinario, administrador | Abrir detalle de un cliente desde administración. |
| Clientes | `PATCH /clientes/:id` | Administrador | Editar datos desde **Clientes**. |
| Clientes | `DELETE /clientes/:id` | Administrador | Desactivar una cuenta de cliente de prueba. |
| Mascotas propias | `GET /clientes/me/mascotas` | Cliente conectado | Revisar que solo incluya sus mascotas. |
| Veterinarios disponibles | `GET /veterinarios/disponibles` | Cualquier usuario autenticado | Revisar la lista que permite solicitar turnos. |
| Veterinarios | `GET /veterinarios`, `GET /veterinarios/:id` | Veterinario, administrador | Listar y abrir detalle desde **Equipo**. |
| Veterinarios | `POST /veterinarios` | Administrador | Perfil directo; para el flujo normal usa **Equipo**, que también crea la cuenta. |
| Veterinarios | `PATCH /veterinarios/:id`, `DELETE /veterinarios/:id` | Administrador | Editar o desactivar el veterinario de prueba. |
| Administradores | `GET /administradores`, `GET /administradores/:id` | Administrador | Listar y abrir detalle. |
| Administradores | `POST /administradores` | Administrador | Perfil directo; para el flujo normal usa **Administradores** y crea usuario + perfil juntos. |
| Administradores | `PATCH /administradores/:id`, `DELETE /administradores/:id` | Administrador | Editar o desactivar otra cuenta administrativa de prueba. |
| Mascotas | `GET /mascotas`, `GET /mascotas/:id` | Autenticado; cliente solo propias | Listar, abrir detalle y probar aislamiento por cliente. |
| Mascotas | `POST /mascotas` | Autenticado | Crear desde **Pacientes** o **Mis mascotas**. |
| Mascotas | `PATCH /mascotas/:id` | Autenticado; cliente solo propias | Editar el registro de prueba. |
| Mascotas | `DELETE /mascotas/:id` | Veterinario, administrador | Baja lógica desde **Pacientes**. |
| Agendas | `GET /agendas`, `GET /agendas/:id` | Veterinario, administrador | Consultar agenda y abrir detalle. |
| Agendas | `POST /agendas`, `PATCH /agendas/:id`, `DELETE /agendas/:id` | Administrador | Crear, editar y borrar un horario de prueba sin reservas. |
| Turnos | `GET /turnos`, `GET /turnos/:id` | Autenticado; cliente/veterinario solo los propios/asignados | Listar, abrir detalle y verificar aislamiento. |
| Turnos | `POST /turnos` | Autenticado; cliente solo para sus mascotas | Solicitar un turno futuro y probar conflicto de horario. |
| Turnos | `PATCH /turnos/:id/cancelar`, `PATCH /turnos/:id/reprogramar` | Autenticado; sujeto a pertenencia | Cancelar o reprogramar el turno de prueba. |
| Turnos | `PATCH /turnos/:id` | Veterinario, administrador; sujeto a pertenencia | Actualizar un turno permitido. |
| Turnos | `DELETE /turnos/:id` | Administrador | Eliminación definitiva; reservar para un turno descartable. |
| Historias | `GET /historiales-clinicos`, `GET /historiales-clinicos/:id` | Veterinario, administrador | Listar y abrir detalle. |
| Historias por mascota | `GET /historiales-clinicos/mascota/:mascotaId` | Veterinario, administrador | Consultar la historia asociada a la mascota. |
| Historias | `POST /historiales-clinicos`, `PATCH /historiales-clinicos/:id` | Veterinario, administrador | Crear o editar desde **Historias clínicas**. |
| Historias | `DELETE /historiales-clinicos/:id` | Administrador | Eliminar solo una ficha de prueba. |
| Consultas | `GET /consultas`, `GET /consultas/:id`, `POST /consultas`, `PATCH /consultas/:id` | Veterinario, administrador | Consultar detalle, crear y editar una consulta. |
| Consultas | `DELETE /consultas/:id` | Administrador | Eliminar una consulta de prueba. |
| Vacunaciones | `GET /vacunaciones`, `GET /vacunaciones/:id`, `POST /vacunaciones`, `PATCH /vacunaciones/:id` | Veterinario, administrador | Consultar detalle, crear y editar una vacunación. |
| Vacunaciones | `DELETE /vacunaciones/:id` | Administrador | Eliminar una vacunación de prueba. |
| Caja | `GET /caja` | Administrador | Listar cajas. |
| Caja | `POST /caja/abrir` | Administrador | Abrir con saldo inicial de prueba. |
| Caja | `POST /caja/:id/cerrar` | Administrador | Cerrar la caja de prueba. |
| Caja | `GET /caja/:id/reporte-diario` | Administrador | Revisar totales de esa caja. |
| Pagos | `GET /configuracion/pagos` | Público | Ver alias, titular e imagen QR configurados. |
| Ingresos | `GET /ingresos`, `POST /ingresos` | Administrador | Consultar y registrar en una caja abierta. |
| Egresos | `GET /egresos`, `POST /egresos` | Administrador | Consultar y registrar en una caja abierta. |

### Límites a tener en cuenta

- `POST /clientes`, `POST /veterinarios` y `POST /administradores` crean perfiles directos. El frontend evita usarlos para las altas habituales porque una cuenta y su perfil deben quedar vinculados. Para probar creación de usuarios, utiliza `POST /auth/register` o `POST /auth/usuarios` según corresponda.
- No existen rutas `GET /ingresos/:id`, `PATCH` o `DELETE` para ingresos y egresos; solo listado y alta.
- El pago QR no se confirma automáticamente. No marques un ingreso como transferencia recibida si no fue verificado fuera de PawSys.
- La cancelación de turnos y la baja de personas conservan información de negocio; no equivalen a eliminar todas sus relaciones.

## 7. Cierre y registro de resultados

- [ ] Cierra sesión de todas las cuentas.
- [ ] Anota las pruebas aprobadas, fallidas y cualquier mensaje inesperado.
- [ ] No publiques tokens, contraseñas, datos personales ni información bancaria.
- [ ] Conserva o elimina los registros de prueba según las opciones soportadas y la política del proyecto.

Para detalles de instalación y arquitectura, consulta el [README principal](./README.md) y la documentación de [API](./backend/README.md).
