// ==========================================
// JanaoBangla — React App Entry Point
// BRANCH: main
// Ei file ta React application er shuru howa jaiga
// Bootstrap, CSS, BrowserRouter sob ekhane import hocche
// ==========================================

import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Bootstrap CSS import — responsive grid, utilities er jonno
import 'bootstrap/dist/css/bootstrap.min.css';

// Leaflet CSS import — Map tile ar markers rendering style er jonno
import 'leaflet/dist/leaflet.css';

// JanaoBangla global CSS import kora hocche — design system
import './styles/global.css';
import './styles/responsive.css';

// Root App component import kora hocche
import App from './App';

// ==========================================
// createRoot — React 18 er noya rendering API
// #root div e React app mount kora hocche (index.html e ache)
// StrictMode diye development warnings dekhabe
// BrowserRouter diye React Router kaj korbe
// ==========================================
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
