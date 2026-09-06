const APP_DIR = "/opt/arivo/app";

module.exports = {
  apps: [
    {
      name: "arivo-backend",
      cwd: `${APP_DIR}/Backend`,
      script: "index.js",
      interpreter: "node",
      env: { NODE_ENV: "production", PORT: "5000" },
      max_memory_restart: "800M",
      restart_delay: 3000,
    },
    {
      name: "arivo-frontend",
      cwd: `${APP_DIR}/frontend`,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
      max_memory_restart: "800M",
      restart_delay: 3000,
    },
  ],
};