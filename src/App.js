// Updated App.js for professional and aesthetic UI redesign
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

import Optimization from './components/Optimization';
import WhatIfAnalysis from './components/WhatIfAnalysis';
import Reports from './components/Reports'; // Correctly imported Reports component
import Navbar from './components/Sidebar';
import './App.css';
import './styles/Sidebar.css'; // Styling for Navbar
import './styles/Dashboard.css'; // Styling for Dashboard
import './styles/Optimization.css'; // Styling for Optimization
import './styles/WhatIfAnalysis.css'; // Styling for WhatIfAnalysis

function App() {
  return (
    <Router>
      <Navbar /> {/* Enhanced Navbar for a professional UI */}
      <div className="app-container dark-theme"> {/* Dark theme container for consistent styling */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/whatifanalysis" element={<WhatIfAnalysis />} />
          <Route path="/reports" element={<Reports />} /> {/* Correct component reference */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
