// next.config.ts (FIXED FOR TURBOPACK STABLE)

import type { NextConfig } from 'next';

const config: NextConfig = {
  // ✅ Updated for Next.js 15.3.2 - moved from experimental
  serverExternalPackages: [
    'pdfjs-dist',
    'canvas',
    'pdf-parse',
  ],
  
  // ✅ Use new turbopack config (not experimental.turbo)
  turbopack: {
    resolveAlias: {
      canvas: 'false',
      encoding: 'false',
    },
  },
  
  // ✅ Configure webpack for PDF.js compatibility (fallback when not using turbopack)
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Disable problematic modules for PDF.js
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle ES modules properly
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Fallbacks for Node.js polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },

  // ✅ Allow external images and worker sources
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
    ],
  },
};

export default config;