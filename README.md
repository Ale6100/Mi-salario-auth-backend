# Mi salario - Backend

[![Code Quality Check](https://github.com/Ale6100/Mi-salario-auth-backend/actions/workflows/lint.yml/badge.svg)](https://github.com/Ale6100/Mi-salario-auth-backend/actions/workflows/lint.yml)

API del proyecto [Mi salario](https://github.com/Ale6100/Mi-salario-auth), una aplicación web para organizar y visualizar las finanzas personales. Guarda las fuentes y conceptos de ingresos y gastos de cada usuario, junto con su fondo de emergencia.

## Stack

NestJS 11 + TypeScript, con MongoDB a través de Mongoose. Los tokens de Auth0 se validan con `express-oauth2-jwt-bearer` y los bodies y queries con `class-validator`.

El deploy se hace en Vercel (`vercel.json`).

## Instalación y ejecución

Requiere Node 24 (la versión que usa el CI).

```bash
npm install
npm run start:dev
```

La documentación de la API (Swagger) queda disponible en `/api`, solo con `NODE_ENV=development`: en producción no se expone.

### Variables de entorno

Se definen en un archivo `.env` en la raíz:

```bash
NODE_ENV = X # con "development" se desactiva la validación del token de Auth0

AUTH_ISSUER_BASE_URL = X # issuer base de Auth0
AUTH_AUDIENCE = X # audience de Auth0

MONGO_URI = X # URI de conexión a MongoDB

FRONT_1 = X # URL del frontend
FRONT_2 = X # URL del frontend. En caso de que desees otro
```

`PORT` es opcional (por defecto, 3000).

### Scripts

| Script | Uso |
| --- | --- |
| `npm run start:dev` | Servidor de desarrollo con recarga |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint:all` | ESLint + chequeo de tipos |
| `npm test` | Tests unitarios con Jest. Los modelos de Mongoose se simulan (`src/test-utils/`), así que no necesitan base de datos |
| `npm run agents:update` | Reemplaza `AGENTS.md` por la última versión de la plantilla del repositorio [Templates-IA](https://github.com/Ale6100/Templates-IA) |

## Autenticación

Todas las rutas requieren un token de Auth0 (RS256).

Cada documento guarda el `sub` de Auth0 del usuario al que pertenece. El `sub` se toma siempre del token (decorador `@UserSub()`), nunca del query ni del body: así un usuario no puede leer ni modificar datos de otro. Toda consulta por ID filtra también por `sub` y responde 404 si el documento no es del usuario, y los conceptos solo se pueden asociar a fuentes del mismo usuario. Como en modo `development` el token no se valida, ahí el `sub` se lee del token sin verificar su firma.

El `ValidationPipe` global descarta los campos que no estén declarados en los DTOs.

## Estructura

Hay un módulo de NestJS por recurso en `src/`, cada uno con su controller, service, schema de Mongoose y DTOs:

| Módulo | Ruta | Contenido |
| --- | --- | --- |
| `fuentes_ingresos` | `/fuentes-ingresos` | Fuentes de ingreso del usuario (nombre, color, si está activa, si es aguinaldo) |
| `conceptos_ingresos` | `/conceptos-ingresos` | Montos ingresados por fuente en cada período |
| `fuentes_gastos` | `/fuentes-gastos` | Fuentes de gasto del usuario (nombre, color, si es indispensable) |
| `conceptos_gastos` | `/conceptos-gastos` | Gastos por fuente en cada período, con su estado de pago |
| `fondo_emergencia` | `/fondo-emergencia` | Un documento por usuario con el ahorro de emergencia y su configuración |

`src/utils/` contiene DTOs de query, validadores y helpers compartidos (el decorador `@UserSub()` y el manejo de errores, que no expone al cliente el detalle de los errores internos).

## Reglas de negocio

- **Períodos**: los conceptos se agrupan por mes con formato `YYYY-MM`.
- **Gastos en monto o porcentaje**: un concepto de gasto se define con un `monto` fijo o con un `porcentaje_total` de los ingresos de su período. El valor `-1` en cualquiera de los dos indica que no se usa; al leer los gastos, la API devuelve siempre el `monto` ya calculado.
- **Fuentes con conceptos**: una fuente no se puede eliminar mientras tenga conceptos asociados (responde 409).
- **Copiar el mes anterior**: `POST /conceptos-gastos/copiar-periodo-anterior` y `POST /conceptos-ingresos/copiar-periodo-anterior` copian al `periodo_destino` los conceptos del mes previo, para no recargar cada mes los que se repiten. No pisan las fuentes que ya tienen un concepto en el mes destino. Los gastos copiados quedan sin pagar y sin aclaración, y los definidos por porcentaje se copian como porcentaje (no con el monto final con el que se pagaron); en ingresos se omiten las fuentes inactivas y las de aguinaldo, que no se cobran todos los meses.
- **Fondo de emergencia**: `porcentaje_total` es la parte del excedente mensual (ingresos menos gastos) que se reserva para el fondo (33.33 % si el usuario no lo configuró). `incluir_dolares` indica si los dólares (`monto_dolares`) cuentan como parte del fondo; la conversión a pesos la hace el frontend.

## CI

En cada push, GitHub Actions corre `npm run lint:all` y `npm test`. Si alguno falla, avisa por WhatsApp mediante CallMeBot, usando los secrets `WHATSAPP_PHONE` y `WHATSAPP_API_KEY` del repositorio.
