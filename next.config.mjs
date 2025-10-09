/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || 'cdn.producthub.example',
        port: '',
        pathname: '/s/files/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_ORDERSYNC_CDN || 'api.ordersync.example',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
