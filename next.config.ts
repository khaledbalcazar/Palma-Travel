import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  /* Cabeceras de seguridad para todo el sitio. */
  async headers() {
    return [
      {
        source: "/:ruta*",
        headers: [
          /* Que el navegador no adivine el tipo de archivo. */
          { key: "X-Content-Type-Options", value: "nosniff" },
          /* Que nadie meta el sitio dentro de un iframe ajeno. */
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          /* Al salir del sitio, solo se manda el dominio, no la página. */
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* No usamos cámara, micrófono ni ubicación. */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        /* Las propuestas personalizadas nunca se indexan, ni siquiera si
           alguien enlaza una desde afuera. */
        source: "/propuesta/:ruta*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/admin/:ruta*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
