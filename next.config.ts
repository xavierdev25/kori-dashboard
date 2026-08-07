import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Origen del backend, para no abrir `connect-src` a todo https:. */
function getApiOrigin() {
  const raw = process.env.NEXT_PUBLIC_API_URL;

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

const apiOrigin = getApiOrigin();

/**
 * CSP del panel.
 *
 * `script-src` lleva 'unsafe-inline': el App Router emite scripts inline de
 * hidratacion y la alternativa (nonce por request) obliga a renderizado
 * dinamico en un panel que hoy es 100% estatico. `style-src` lo necesita por
 * los `style={{...}}` de las previews de notitas.
 *
 * `img-src` admite https: porque los dibujos se sirven desde Supabase
 * Storage, y blob:/data: porque html-to-image genera el PNG de descarga.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // No anunciar el framework
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Seguridad en todas las respuestas
        source: "/:path*",
        headers: securityHeaders,
      },
      // El panel muestra datos de moderacion: nada de cache compartida ni de
      // historial del navegador tras cerrar sesion. Los assets con hash de
      // /_next/static conservan su cache inmutable (no entran aqui).
      // "/dashboard/:path*" tambien casa con "/dashboard" a secas.
      ...["/", "/login", "/dashboard/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      })),
    ];
  },
};

export default nextConfig;
