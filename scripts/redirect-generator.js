/**
 * 301 Redirect Generator
 * Converts a list of dead/404 URLs into Nginx/Apache/Next.js redirect rules.
 */
const fs = require('fs');

const deadLinks = [
  { old: '/old-about-us', new: '/about' },
  { old: '/cakes/wedding-cakes-2022', new: '/cakes/wedding' },
  // Add the "Not found (404)" and "Redirect error" URLs from Search Console here
];

function generateNginx() {
  console.log('--- NGINX Redirects ---');
  deadLinks.forEach(link => {
    console.log('rewrite ^' + link.old + '$ ' + link.new + ' permanent;');
  });
}

function generateNextJs() {
  console.log('\n--- Next.js next.config.js Redirects ---');
  const nextRedirects = deadLinks.map(link => ({
    source: link.old,
    destination: link.new,
    permanent: true,
  }));
  console.log(JSON.stringify(nextRedirects, null, 2));
}

generateNginx();
generateNextJs();