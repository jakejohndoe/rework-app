// next.config.js (FIXED FOR PDF.JS)

import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: [
    'pdf-parse',        // Keep for text extraction
    'pdf-poppler',      // Add for thumbnail generation
    'sharp',            // Add for image optimization
  ],
  
  turbopack: {
    resolveAlias: {
      canvas: 'false',
      encoding: 'false',
    },
  },
  
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Exclude problematic modules for browser builds
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // For PDF.js compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false, // Exclude canvas for browser
      };
    }
    
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },

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