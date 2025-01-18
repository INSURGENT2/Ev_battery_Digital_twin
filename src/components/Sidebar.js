import React from 'react';
import { Link } from 'react-router-dom';
// 2) Import Font Awesome bits here too
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCogs,
  faQuestionCircle,
  faFileAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';

import '../styles/Sidebar.css';

function Sidebar({ activePage }) {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">EV Battery Digital Twin</h1>
      <nav className="sidebar-links">
        <Link
          className={`sidebar-link ${activePage === 'Dashboard' ? 'active' : ''}`}
          to="/"
        >
          <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
          Home
        </Link>
        <Link
          className={`sidebar-link ${activePage === 'Optimization' ? 'active' : ''}`}
          to="/optimization"
        >
          <FontAwesomeIcon icon={faCogs} className="sidebar-icon" />
          Optimization
        </Link>
        <Link
          className={`sidebar-link ${activePage === 'WhatIfAnalysis' ? 'active' : ''}`}
          to="/whatifanalysis"
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="sidebar-icon" />
          What-If Analysis
        </Link>
        <Link
          className={`sidebar-link ${activePage === 'Reports' ? 'active' : ''}`}
          to="/reports"
        >
          <FontAwesomeIcon icon={faFileAlt} className="sidebar-icon" />
          Reports
        </Link>
        <Link
          className={`sidebar-link ${activePage === 'Settings' ? 'active' : ''}`}
          to="/settings"
        >
          <FontAwesomeIcon icon={faCog} className="sidebar-icon" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
