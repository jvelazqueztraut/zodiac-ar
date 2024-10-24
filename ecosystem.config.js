module.exports = {
  apps: [
    {
      name: "zodiac-ar-frontend",
      cwd: "./frontend",
      script: "start-dev-process.js",
      watch: false,
      env: {
        NODE_ENV: "local",
      }
    },
  ],
};
