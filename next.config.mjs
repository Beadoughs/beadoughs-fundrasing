/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/fundraisers",
        destination: "/book",
        permanent: false,
      },
      {
        source: "/fundraisers/:path*",
        destination: "/book",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
