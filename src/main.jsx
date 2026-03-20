import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initStorage } from './db/storage';
import './index.css';

async function init() {
  await initStorage();
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
}

init();
