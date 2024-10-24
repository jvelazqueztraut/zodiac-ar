const { spawn } = require('child_process');

const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

const npmi = spawn(npm, ['i'], {
  stdio: [process.stdin, process.stdout, process.stderr],
});

npmi.on('close', () => {
  const npmRunDev = spawn(npm, ['run', 'dev'], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  npmRunDev.on('close', code => {
    console.log('Development server exited with code', code);
  });
});
