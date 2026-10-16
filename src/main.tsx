import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BibleProvider } from './context/BibleContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BibleProvider>
      <App />
    </BibleProvider>
  </React.StrictMode>
);
