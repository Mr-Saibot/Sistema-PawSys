# Diseño de PawSys

## Dirección visual

La interfaz transmite calidez y confianza, con claridad propia de una
aplicación moderna de salud. La mascota ocupa el centro de la ficha.

Se priorizan el espacio, la jerarquía tipográfica y los bordes sutiles.
La información se presenta en contexto, no en paneles administrativos
genéricos.

## Tokens

Los colores, tipografía, radios y sombras se definen en
`tailwind.config.cjs`. Las pantallas usan esos tokens en lugar de
valores de color arbitrarios.

| Token | Valor | Uso |
|---|---|---|
| `fondo` | `#FAFAF9` | Fondo principal |
| `superficie` | `#FFFFFF` | Tarjetas y paneles |
| `borde` | `#E7E5E4` | Separadores y contornos |
| `texto` | `#1C1917` | Texto principal |
| `texto-suave` | `#78716C` | Texto secundario |
| `primario` | `#E4684F` | Acciones y acentos |
| `primario-suave` | `#FDEBE6` | Selección y fondos de chips |
| `primario-oscuro` | `#B84A34` | Hover y énfasis |
| `verde-profundo` | `#2F5D50` | Títulos y navegación activa |
| `exito` | `#16A34A` | Confirmaciones |
| `error` | `#DC2626` | Errores |

La fuente preferida es Inter, con fuentes de sistema como respaldo.
El tamaño base es 14 px y los títulos usan 20, 24 o 32 px.

## Componentes y espaciado

- Los botones e inputs usan radio de 8 px; las tarjetas, 10 px.
- Los indicadores compactos usan forma de píldora.
- El espaciado utiliza múltiplos de 4 px.
- Los íconos Lucide usan trazo delgado y complementan, no sustituyen,
  las etiquetas.
- Los controles mantienen foco visible y etiquetas accesibles.

## Experiencia completa

La entrada principal y la navegación usan React, con secciones que cambian
según el rol. Inicio reúne las próximas citas y tareas útiles. Agenda
presenta una semana de horarios disponibles y reservados. Pacientes usa
tarjetas con la mascota en primer plano y enlaza a su ficha.

La ficha presenta los datos disponibles, el contacto del responsable y el
historial como una línea de tiempo. Los datos que la API todavía no almacena
no se inventan: se identifican como no disponibles o se muestran con un
estado vacío explicativo. Los formularios de alta y edición se abren en
paneles laterales para conservar el contexto de la pantalla.

Propietarios, equipo, historias clínicas, pagos y caja reutilizan los mismos
componentes, colores y estados. Inventario y facturación completa no se
presentan como funciones disponibles porque la API aún no las implementa.

El diseño responde a escritorio, tablet y celular. En pantallas chicas,
la navegación y las secciones se reorganizan sin ocultar acciones.

## Estados de interfaz

Las cargas usan esqueletos, no indicadores giratorios. Los listados
tienen estados vacíos y de error con mensajes claros y acciones cuando
corresponda.

## Alcance implementado

La entrada principal `index.html` carga la aplicación React. Las pantallas
habilitadas por rol cubren inicio, agenda, pacientes y ficha, historias
clínicas, propietarios, equipo, administradores, caja/cobros y pagos. La
entrada `ficha.html` conserva acceso directo a la ficha clínica.

Los cambios que requieren autorización administrativa siguen pasando por
el servicio HTTP existente, que solicita el PIN antes de enviar la
operación. La interfaz no reemplaza los permisos aplicados por el backend.
