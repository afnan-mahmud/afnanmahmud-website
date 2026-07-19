// pm2 process for the course.afnanmahmud.com subdomain app.
// Build first (`npm run build` in this folder) THEN `pm2 start ecosystem.config.js`.
// Run from the course-landing/ directory.
module.exports = {
  apps: [
    {
      name: 'course-landing',
      // Standalone entrypoint produced by `next build` (output: 'standalone').
      script: '.next/standalone/course-landing/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        // Keeps the EPS payment round-trip on the subdomain (see README).
        NEXTAUTH_URL: 'https://course.afnanmahmud.com',
      },
    },
  ],
};
