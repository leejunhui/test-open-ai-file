interface Window {
  electronAPI: {
    downloadFile: (url: string, filename: string) => Promise<string>;
    openFile: (filePath: string) => Promise<void>;
    saveFile: (filePath: string, content: string) => Promise<void>;
    getUserDataPath: () => Promise<string>;
    getCacheFilePath: (filename: string) => Promise<string>;
    readFile: (filePath: string) => Promise<string>;
  };
}
