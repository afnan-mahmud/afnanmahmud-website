// PM2 process definition for the Next.js production server.
// Started/reloaded by scripts/deploy.sh via `pm2 startOrReload ecosystem.config.js`.
module.exports = {
  apps: [
    {
      name: 'afnan-web',
      // Run the Next.js CLI directly (more reliable under PM2 than `npm start`).
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
  ],
};
