module.exports = {
  apps: [
    {
      name: "autosure-api",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "autosure-worker",
      script: "./worker.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
