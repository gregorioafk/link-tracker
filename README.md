# Link Tracker

Una aplicación NestJS para crear URLs enmascaradas, redirigir, invalidar y obtener estadísticas.

## Características

- Creación de enlaces cortos
- Protección de enlaces con contraseña
- Fecha de expiración para enlaces
- Estadísticas de uso (número de clics)
- Bloqueo de IPs
- Documentación con Swagger
- Validación de datos con class-validator
- Almacenamiento en memoria (sin base de datos)

## Requisitos previos

- Node.js (v14 o superior)
- npm, yarn o bun

## Instalación

```bash
# Instalar dependencias
npm install
```

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura de pruebas
npm run test:cov
```

## Documentación API

La documentación de la API está disponible en `/api` utilizando Swagger UI.

## Endpoints

| Método | Ruta              | Descripción                     |
| ------ | ----------------- | ------------------------------- |
| POST   | /link             | Crear un nuevo enlace           |
| GET    | /l/:id            | Redirigir a la URL original     |
| GET    | /l/:id/stats      | Obtener estadísticas del enlace |
| PUT    | /l/:id            | Actualizar un enlace existente  |
| PUT    | /l/:id/invalidate | Invalidar un enlace             |

## Bloqueo de IPs

El sistema permite bloquear IPs definidas en el archivo `blockedips.json` en la raíz del proyecto.

## Persistencia de datos

Esta implementación utiliza almacenamiento en memoria, lo que significa que todos los datos se perderán cuando se reinicie el servidor. Esto es ideal para entornos de desarrollo o pruebas.

## Estructura del proyecto

```
src/
├── modules/
│   └── link/
│       ├── dto/
│       │   ├── create-link.dto.ts
│       │   └── update-link.dto.ts
│       ├── interfaces/
│       │   └── link.interface.ts
│       ├── repositories/
│       │   └── in-memory-link.repository.ts
│       ├── link.controller.ts
│       ├── link.service.ts
│       ├── link.module.ts
│       ├── link.controller.spec.ts
│       └── link.service.spec.ts
├── middlewares/
│   └── ip-blocker.middleware.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```
