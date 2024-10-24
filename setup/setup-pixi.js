const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

module.exports = function (answers) {
  const { is_pixi_project } = answers;

  if (is_pixi_project) return;

  try {
    fs.rmSync(path.join(__dirname, './../frontend/src/assets/game'), { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, './../frontend/src/template/components/GameView'), { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, './../frontend/src/template/utils/pixi.ts'));
  } catch {
    // Do nothing if the files already do not exist
  }

  spawn(npm, ['remove', 'pixi.js'], {
    cwd: path.join(__dirname, './../frontend'),
    stdio: [process.stdin, process.stdout, process.stderr],
  });
};
