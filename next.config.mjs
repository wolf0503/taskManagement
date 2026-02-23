import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
const apiOrigin = apiBase.replace(/\/api\/v1\/?$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix 404 when multiple lockfiles exist (parent dir): force project root
  outputFileTracingRoot: __dirname,
  // Proxy /api/uploads/* to backend so avatar images work (avoids CORS/CORP block)
  async rewrites() {
    return [
      { source: "/api/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` },
    ]
  },
}

export default nextConfig
