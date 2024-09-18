import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'antd/dist/reset.css'; // 使用 antd v5 的 reset.css

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
