module.exports = {
  apps: [
    {
      name: "{gcp_project_id}-db",
      cwd: ".",
      script: "start-docker-compose-db.js",
      watch: false,
    },
    {
      name: "{gcp_project_id}-cms",
      cwd: "./cms",
      script: "start-dev-process.js",
      watch: false,
      env: {
        NODE_ENV: "development",
        DB_HOST: "localhost",
        DB_PORT: 3308,
        DB_USERNAME: "root",
        DB_PASSWORD: "password",
        DB_NAME: "cms",
        GCLOUD_PROJECT_ID: "{gcp_project_id}",
        CMS_ADMIN_PASSWORD: "Password1",
        ADMIN_JWT_SECRET: "secret"
      }
    },
    {
      name: "{gcp_project_id}-frontend",
      cwd: "./frontend",
      script: "start-dev-process.js",
      watch: false,
      env: {
        NODE_ENV: "local",
      }
    },
  ],
};
