export async function downloadAIFile(): Promise<string> {
  const url = 'https://yuntisys.oss-cn-qingdao.aliyuncs.com/25HNWLLXCDA1.ai';
  const filename = '25HNWLLXCDA1.ai';
  return window.electronAPI.downloadFile(url, filename);
}

export async function openWithAdobeAI(filePath: string): Promise<void> {
  try {
    await window.electronAPI.openFile(filePath);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`打开文件失败: ${error.message}`);
    } else {
      throw new Error('打开文件时发生未知错误');
    }
  }
}

export async function saveAIFile(): Promise<void> {
  try {
    const cacheFilePath = await window.electronAPI.getCacheFilePath('25HNWLLXCDA1.ai');
    const fileContent = await window.electronAPI.readFile(cacheFilePath);
    console.log("缓存文件内容:", fileContent);
    // 这里可以添加将文件保存到用户选择的位置的逻辑
  } catch (error) {
    console.error('读取缓存文件失败:', error);
    throw new Error('无法读取或找到缓存的 AI 文件');
  }
}
