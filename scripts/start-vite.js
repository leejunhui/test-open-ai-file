const { createServer } = require('vite');
const { exec } = require('child_process');

async function startViteServer() {
  const server = await createServer({
    configFile: 'vite.config.ts',
    server: {
      port: 5173,
    },
  });

  await server.listen();

  console.log('Vite server started');
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
}

startViteServer();
