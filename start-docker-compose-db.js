const { spawn } = require("child_process");

const npmi = spawn("docker", ["compose", "-f", "docker-compose-db.yml", "up"], {
  stdio: [process.stdin, process.stdout, process.stderr],
});

npmi.on("close", (code) => {
  console.log("Development server exited with code", code);
});
