/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@modelcontextprotocol/sdk'],
  
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
