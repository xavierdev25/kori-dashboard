# kori-dashboard

Panel administrativo de kor! (Next.js 16 + Tailwind 4). Consume `kori-backend`.

## Funciones

- **Resumen** — métricas: total de notas, por tipo y **pendientes de revisión**.
- **Notas** — listado con filtros (tipo, **estado**, búsqueda, paginación),
  vista de tarjetas en móvil, detalle con preview, **aprobar** (pre-moderación),
  **quitar del muro** (vuelve a `PENDING` sin borrarla), descargar como imagen
  y borrar.
- **Correos** — suscriptores del "Coming soon" de la landing, con **exportar CSV**.
- **Ajustes** — fecha objetivo del contador de la landing y link del álbum
  (el botón que aparece cuando el contador llega a cero).

## Desarrollo

```sh
pnpm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL → backend
pnpm dev                           # http://localhost:3000
pnpm exec vitest run               # tests
pnpm lint
```

Credenciales: las definidas en el `.env` del backend (`ADMIN_USERNAME` /
`ADMIN_PASSWORD_HASH`).

## Arquitectura

`src/features/<feature>/{components,hooks,services,types,utils}` por dominio
(auth, notes, subscribers, settings) + `src/shared` para UI y utilidades.

## Seguridad

`next.config.ts` define los headers de todas las respuestas: CSP, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP y HSTS,
más `Cache-Control: no-store` en `/`, `/login` y `/dashboard/*` (los assets con
hash de `/_next/static` conservan su caché inmutable).

`connect-src` se calcula desde `NEXT_PUBLIC_API_URL` en build: **si esa variable
no está definida en Vercel, la CSP bloqueará las llamadas al backend.**

La CSP lleva `'unsafe-inline'` en `script-src` porque el App Router emite scripts
inline de hidratación; endurecerlo exige nonces por request y, con ello,
renderizado dinámico.

El *rate limiting* vive en el backend (`POST /auth/login`: 5 req/60 s); el panel
no expone rutas de servidor propias.
