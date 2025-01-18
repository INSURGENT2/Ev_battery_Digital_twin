import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faTools,
  faThermometerHalf,
  faBolt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import Sidebar from './Sidebar';
import ThreeScene from './ThreeScene'; // <-- IMPORT YOUR THREE.JS SCENE
import '../styles/Dashboard.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [throughputData, setThroughputData] = useState([]);
  const [defectRateData, setDefectRateData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [labels, setLabels] = useState([]);

  const [inspectionPassRate, setInspectionPassRate] = useState(null);
  const [failureProbability, setFailureProbability] = useState(null);
  const [highRisk, setHighRisk] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/predictive-data');
        const result = await response.json();
        const timestamp = new Date().toLocaleTimeString();

        // Example interpretation for the chart data
        const newThroughput = result?.input_data?.temperature ?? 0;
        const newDefectRate = 1 - (result?.input_data?.defect_rate ?? 0);
        const newEnergy = result?.input_data?.energy_consumption ?? 0;

        setThroughputData((prev) => [...prev, newThroughput.toFixed(2)].slice(-10));
        setDefectRateData((prev) => [...prev, (newDefectRate *-1).toFixed(2)].slice(-10));
        setEnergyData((prev) => [...prev, newEnergy.toFixed(2)].slice(-10));
        setLabels((prev) => [...prev, timestamp].slice(-10));

        // Other metrics
        setInspectionPassRate(result?.input_data?.inspection_pass_rate?.toFixed(2));
        setFailureProbability(result?.failure_probability?.[0]?.toFixed(2));

        // High risk popup
        if (result.high_risk?.[0] && !highRisk) {
          setHighRisk(true);
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000);
        } else {
          setHighRisk(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [highRisk]);

  // Chart data configs
  const throughputChartData = {
    labels,
    datasets: [
      {
        label: 'Throughput',
        data: throughputData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
      },
    ],
  };

  const defectRateChartData = {
    labels,
    datasets: [
      {
        label: 'Defect Rate (%)',
        data: defectRateData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.4,
      },
    ],
  };

  const energyChartData = {
    labels,
    datasets: [
      {
        label: 'Energy (kWh)',
        data: energyData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="dashboard">
      {/* Sidebar (fixed) */}
      <Sidebar activePage="Dashboard" />

      <div className="dashboard-content">
        {/* Header with search */}
        <header className="dashboard-header">
          <input type="text" className="search-bar" placeholder="Search..." />
        </header>

        {/* Main 2x2 Grid Layout */}
        <div className="main-grid">
          {/* Top-left: 3D Model */}
          <div className="model-container">
            <h3>3D Battery Module Digital Twin</h3>
            <div className="model-area">
              {/* REPLACE the placeholder with your Three.js scene */}
              <ThreeScene />
            </div>
          </div>

          {/* Top-right: Overview (5 cards) */}
          <div className="overview-container">
            <div className="overview-item">
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span>Throughput</span>
              <strong>{throughputData.slice(-1)[0] ?? '...'}</strong>
            </div>

            <div className="overview-item">
              <FontAwesomeIcon icon={faTools} />
              <span>Defect Rate (%)</span>
              <strong>{defectRateData.slice(-1)[0] ?? '...'}</strong>
            </div>

            <div className="overview-item">
              <FontAwesomeIcon icon={faThermometerHalf} />
              <span>Inspection Pass Rate (%)</span>
              <strong>{inspectionPassRate || '...'}</strong>
            </div>

            <div className="overview-item">
              <FontAwesomeIcon icon={faBolt} />
              <span>Failure Probability</span>
              <strong>{failureProbability || '...'}</strong>
            </div>

            <div className="overview-item">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>High Risk</span>
              <strong className={highRisk ? 'high-risk' : 'low-risk'}>
                {highRisk ? 'Yes' : 'No'}
              </strong>
            </div>
          </div>

          {/* Bottom-left: 3 charts */}
          <div className="charts-container">
            <div className="chart-box">
              <h4>Throughput vs Time</h4>
              <Line data={throughputChartData} options={{ responsive: true }} />
            </div>
            <div className="chart-box">
              <h4>Defect Rate vs Time</h4>
              <Line data={defectRateChartData} options={{ responsive: true }} />
            </div>
            <div className="chart-box">
              <h4>Energy Consumption</h4>
              <Line data={energyChartData} options={{ responsive: true }} />
            </div>
          </div>

          {/* Bottom-right: Recommendations + Logs */}
          <div className="logs-container">
            <h4>Top Recommendations</h4>
            <ul>
            <li>Optimize sensor calibration to ensure accurate data collection.</li>
    <li>Review historical failure records for patterns and trends.</li>
    <li>Prioritize maintenance on components flagged as high-risk.</li>
            </ul>

            
          </div>
        </div>

        {/* If high risk, show popup */}
        {showPopup && (
          <div className="popup">⚠️ High Risk Detected! Immediate Attention Required.</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
