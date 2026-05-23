/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        'tw-animate-css': new URL(
          './node_modules/tw-animate-css/dist/tw-animate.css',
          import.meta.url
        ).pathname
      }
    }
  },
  allowedDevOrigins: ['*'],
  output: 'standalone',
  images: {
    remotePatterns: [
      new URL('https://media.tenor.com/**'),
    ],
  },
  reactStrictMode : false
}

export default nextConfig
