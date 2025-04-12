/**
 * This script generates a sitemap.xml file for the Quizitt website
 * Run with: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const prettier = require('prettier');

const SITE_URL = 'https://quizitt.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DIR = path.join(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');

// Pages that should be excluded from the sitemap
const EXCLUDED_PATHS = [
  '/_app',
  '/_document',
  '/api',
  '/404',
  '/500',
  '/_error',
];

// Define page priorities and change frequencies
const PAGE_CONFIGS = {
  '/': { priority: 1.0, changefreq: 'daily' },
  '/pdfquizgenerator': { priority: 0.9, changefreq: 'weekly' },
  '/dashboard': { priority: 0.8, changefreq: 'daily' },
  '/about': { priority: 0.8, changefreq: 'monthly' },
  '/features': { priority: 0.8, changefreq: 'monthly' },
  '/pricing': { priority: 0.8, changefreq: 'monthly' },
  '/contact': { priority: 0.7, changefreq: 'monthly' },
  '/profile': { priority: 0.7, changefreq: 'weekly' },
  '/history': { priority: 0.7, changefreq: 'weekly' },
  '/howItworks': { priority: 0.8, changefreq: 'monthly' },
  '/communities': { priority: 0.6, changefreq: 'weekly' },
  '/blog': { priority: 0.6, changefreq: 'weekly' },
  '/terms': { priority: 0.3, changefreq: 'yearly' },
  '/privacy': { priority: 0.3, changefreq: 'yearly' },
};

// Get default configs for pages not explicitly defined
const DEFAULT_CONFIG = { priority: 0.5, changefreq: 'monthly' };

// Format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = date || new Date();
  return d.toISOString().split('T')[0];
};

// Find all app pages (excluding api routes and other non-page files)
const findPages = () => {
  // Find all page.tsx files in the app directory
  const pages = glob.sync(`${APP_DIR}/**/page.{ts,tsx,js,jsx}`);
  
  return pages
    .map(page => {
      // Convert file path to route
      const route = page
        .replace(APP_DIR, '')
        .replace(/\/page\.(ts|tsx|js|jsx)$/, '')
        // Handle root route
        .replace(/^\/?$/, '/');
        
      // Skip API routes and excluded paths
      if (route.startsWith('/api/') || EXCLUDED_PATHS.some(exc => route.startsWith(exc))) {
        return null;
      }
      
      return route;
    })
    .filter(Boolean); // Remove null values
};

// Generate sitemap XML
const generateSitemap = (pages) => {
  const today = formatDate();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(page => {
      // Get config for this page (or use default)
      const config = PAGE_CONFIGS[page] || DEFAULT_CONFIG;
      
      return `<url>
    <loc>${SITE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`;
    })
    .join('\n  ')}
</urlset>`;

  return sitemap;
};

// Main function
async function generateAndSaveSitemap() {
  try {
    // Find all pages
    const pages = findPages();
    console.log(`Found ${pages.length} pages`);
    
    // Generate sitemap
    const sitemap = generateSitemap(pages);
    
    // Format XML with prettier (returns a promise)
    const formattedSitemap = await prettier.format(sitemap, { parser: 'html' });
    
    // Write sitemap to public directory
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), formattedSitemap);
    console.log('Sitemap generated successfully at public/sitemap.xml');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the script
generateAndSaveSitemap(); 