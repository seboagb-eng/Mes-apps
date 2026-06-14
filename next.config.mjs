/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Les en-têtes de cache pour le service worker et le manifest PWA
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
