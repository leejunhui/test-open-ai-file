import React from 'react';
import { Button, message, ConfigProvider } from 'antd';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';
import { downloadAIFile, openWithAdobeAI, saveAIFile } from './utils';

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

function App() {
  const handleDownload = async () => {
    if (!isElectron) {
      message.error('此功能仅在 Electron 环境中可用');
      return;
    }

    try {
      const filePath = await downloadAIFile();
      await openWithAdobeAI(filePath);
      message.success('文件已成功下载并打开');
    } catch (error) {
      console.error('下载或打开文件时出错:', error);
      if (error instanceof Error) {
        if (error.message.includes('Adobe Illustrator 未安装')) {
          message.error(
            'Adobe Illustrator 未安装或未找到。请确保已安装 Adobe Illustrator。'
          );
        } else {
          message.error('下载或打开文件时出错: ' + error.message);
        }
      } else {
        message.error('下载或打开文件时发生未知错误');
      }
    }
  };

  const handleSave = async () => {
    if (!isElectron) {
      message.error('此功能仅在 Electron 环境中可用');
      return;
    }

    try {
      await saveAIFile();
      message.success('文件已成功保存');
    } catch (error) {
      console.error('保存文件时出错:', error);
      message.error('保存文件时出错: ' + (error as Error).message);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">AI 文件管理器</h1>
          <div className="space-y-4">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              className="w-full"
            >
              下载并打开 AI 文件
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              className="w-full"
            >
              保存 AI 文件
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
