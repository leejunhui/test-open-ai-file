const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadFile: (url, filename) =>
    ipcRenderer.invoke('download-file', url, filename),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  saveFile: (filePath, content) =>
    ipcRenderer.invoke('save-file', filePath, content),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getCacheFilePath: (filename) =>
    ipcRenderer.invoke('get-cache-file-path', filename),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
});
