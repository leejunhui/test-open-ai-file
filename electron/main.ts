import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as os from 'os';
import { exec } from 'child_process';
import * as https from 'https';

console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
console.log('Chrome version:', process.versions.chrome);

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));
  console.log('Preload script content:', fs.readFileSync(preloadPath, 'utf-8'));

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        ],
      },
    });
  });

  if (isDev) {
    win.loadURL('http://127.0.0.1:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('execute-command', (_, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('download-file', async (_, url, filename) => {
  return new Promise<string>((resolve, reject) => {
    https
      .get(url, (response) => {
        const data: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
          data.push(chunk);
        });
        response.on('end', async () => {
          const buffer = Buffer.concat(data);
          const filePath = path.join(
            app.getPath('userData'),
            'cache',
            filename
          );
          await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
          await fsPromises.writeFile(filePath, buffer);
          resolve(filePath);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
});

ipcMain.handle('open-file', async (_, filePath) => {
  const platform = os.platform();
  let command = '';
  let appName = '';

  if (platform === 'win32') {
    const arch = os.arch();
    if (arch === 'x64') {
      command = `start "" "${filePath}"`;
      appName = 'Adobe Illustrator';
    } else {
      throw new Error('不支持的 Windows 架构，需要 64 位系统');
    }
  } else if (platform === 'darwin') {
    command = `open -a "Adobe Illustrator" "${filePath}"`;
    appName = 'Adobe Illustrator';
  } else {
    throw new Error('不支持的操作系统');
  }

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // 检查错误是否与应用程序未找到有关
        if (
          error.message.includes('cannot find the file') ||
          error.message.includes('Unable to find application')
        ) {
          reject(
            new Error(
              `${appName} 未安装或未找到。请确保已安装 Adobe Illustrator。`
            )
          );
        } else {
          reject(error);
        }
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('save-file', async (_, filePath, content) => {
  await fsPromises.writeFile(filePath, content);
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-cache-file-path', (_, filename) => {
  return path.join(app.getPath('userData'), 'cache', filename);
});

ipcMain.handle('read-file', async (_, filePath) => {
  return fsPromises.readFile(filePath, 'utf-8');
});
