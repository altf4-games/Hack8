/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { resolve: { alias: { framer: string; }; }; }) => {
    config.resolve.alias.framer = 'framer-motion/legacy';
    return config;
  },
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile pictures
      'pdftoflashcard.onrender.com', // Render domain
      'quizitt.com', // Custom domain
      'www.quizitt.com', // www subdomain
      'i.ytimg.com', // YouTube thumbnails
      'i.imgur.com' // Imgur images (for backup/fallback thumbnails)
    ]
  },
  // Fix for redirect indexing issues
  async redirects() {
    return [
      // Example redirects - update these with your actual redirect needs
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 301 redirect - passes link equity
      },
      {
        source: '/legacy-path/:slug',
        destination: '/new-path/:slug',
        permanent: true,
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig;