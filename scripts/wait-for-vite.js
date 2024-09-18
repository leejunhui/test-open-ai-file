const http = require('http');
const { exec } = require('child_process');

function checkViteServer(callback) {
  console.log('Checking Vite server...');
  http
    .get('http://127.0.0.1:5173', (res) => {
      console.log(`Received response with status code: ${res.statusCode}`);
      if (res.statusCode === 200) {
        callback(null);
      } else {
        callback(
          new Error(`Server responded with status code ${res.statusCode}`)
        );
      }
    })
    .on('error', (err) => {
      console.error('Error checking Vite server:', err.message);
      callback(err);
    });
}

function waitForViteServer(maxAttempts = 60, interval = 1000) {
  let attempts = 0;

  function attempt() {
    checkViteServer((err) => {
      if (!err) {
        console.log('Vite server is ready');
        exec(
          'pnpm run cross-env NODE_ENV=development ELECTRON_ENABLE_LOGGING=true electron . --enable-logging --trace-warnings',
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          }
        );
      } else if (attempts < maxAttempts) {
        attempts++;
        console.log(
          `Waiting for Vite server... (Attempt ${attempts}/${maxAttempts})`
        );
        setTimeout(attempt, interval);
      } else {
        console.error('Vite server did not start in time');
        process.exit(1);
      }
    });
  }

  attempt();
}

waitForViteServer();
