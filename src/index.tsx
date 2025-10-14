import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/game.css';
import './styles/game.desktop.css';
import './styles/game.mobile.css';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);