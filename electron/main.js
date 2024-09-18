"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fsPromises = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const https = __importStar(require("https"));
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
console.log('Chrome version:', process.versions.chrome);
const isDev = process.env.NODE_ENV !== 'production';
function createWindow() {
    const preloadPath = path.join(__dirname, 'preload.js');
    console.log('Preload script path:', preloadPath);
    console.log('Preload script exists:', fs.existsSync(preloadPath));
    console.log('Preload script content:', fs.readFileSync(preloadPath, 'utf-8'));
    const win = new electron_1.BrowserWindow({
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
    }
    else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.handle('execute-command', (_, command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
});
electron_1.ipcMain.handle('download-file', async (_, url, filename) => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
            const data = [];
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on('end', async () => {
                const buffer = Buffer.concat(data);
                const filePath = path.join(electron_1.app.getPath('userData'), 'cache', filename);
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
electron_1.ipcMain.handle('open-file', async (_, filePath) => {
    const platform = os.platform();
    let command = '';
    let appName = '';
    if (platform === 'win32') {
        const arch = os.arch();
        if (arch === 'x64') {
            command = `start "" "${filePath}"`;
            appName = 'Adobe Illustrator';
        }
        else {
            throw new Error('不支持的 Windows 架构，需要 64 位系统');
        }
    }
    else if (platform === 'darwin') {
        command = `open -a "Adobe Illustrator" "${filePath}"`;
        appName = 'Adobe Illustrator';
    }
    else {
        throw new Error('不支持的操作系统');
    }
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                // 检查错误是否与应用程序未找到有关
                if (error.message.includes('cannot find the file') ||
                    error.message.includes('Unable to find application')) {
                    reject(new Error(`${appName} 未安装或未找到。请确保已安装 Adobe Illustrator。`));
                }
                else {
                    reject(error);
                }
            }
            else {
                resolve(stdout);
            }
        });
    });
});
electron_1.ipcMain.handle('save-file', async (_, filePath, content) => {
    await fsPromises.writeFile(filePath, content);
});
electron_1.ipcMain.handle('get-user-data-path', () => {
    return electron_1.app.getPath('userData');
});
electron_1.ipcMain.handle('get-cache-file-path', (_, filename) => {
    return path.join(electron_1.app.getPath('userData'), 'cache', filename);
});
electron_1.ipcMain.handle('read-file', async (_, filePath) => {
    return fsPromises.readFile(filePath, 'utf-8');
});
