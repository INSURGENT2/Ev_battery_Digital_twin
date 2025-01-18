import React, { useState, useRef } from "react";
import { Card, Button, Form, Row, Col, ProgressBar } from "react-bootstrap";
import { FaChartBar, FaCogs, FaTasks, FaCheckCircle, FaPrint } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/Optimization.css";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// Import processFeatureMap, bakedScenarios, generateChartData, and checkForScenarioMatch
const processFeatureMap = {
  cell_prep: [
    "inspection_pass_rate",
    "temperature",
    "vibration_level",
    "energy_consumption",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  cell_stack: [
    "alignment_accuracy",
    "stacking_speed",
    "alignment_error",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  welding_machine: [
    "welding_temperature",
    "joint_strength_index",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  thermal_installer: [
    "application_pressure",
    "temperature_of_thermal_material",
    "application_speed",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  frame_assembly: [
    "assembly_force",
    "structural_integrity_check",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  busbar_installer: [
    "connection_quality_rating",
    "current_drawn",
    "installation_duration",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  bms_installer: [
    "installation_time",
    "fault_detection",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
  eol_test: [
    "voltage_output",
    "temperature_during_test",
    "ambient_temperature",
    "humidity",
    "air_quality_index",
    "completion_time",
    "process_yield",
    "cycle_time",
    "resource_utilization_rate",
    "order_completion_time",
    "inspection_time",
    "defect_rate",
    "downtime_logged",
  ],
};

// The four baked‑in scenarios
const bakedScenarios = [
  {
    id: 1,
    title: "Improved Energy Efficiency and Quality",
    process: "cell_prep",
    parameters: [
      "inspection_pass_rate",
      "temperature",
      "vibration_level",
      "energy_consumption"
    ],
    objectives: {
      throughput: { target: 70, min: 63, max: 77 },
      defectRate: { target: 3, min: 2.7, max: 3.3 },
      energyConsumption: { target: 90, min: 81, max: 99 },
      costOptimization: { target: 1000, min: 900, max: 1100 },
    },
    graphs: {
      throughput: {
        before: [60, 62, 63, 65, 66, 68, 69, 70, 71, 72],
        after: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77]
      },
      defectRate: {
        before: [5, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1],
        after: [3.5, 3.4, 3.3, 3.2, 3.1, 3, 2.9, 2.8, 2.7, 2.7]
      },
      energyConsumption: {
        before: [110, 108, 106, 104, 102, 100, 98, 96, 94, 92],
        after: [95, 94, 93, 92, 91, 90, 89, 88, 87, 86]
      },
      costOptimization: {
        before: [1200, 1180, 1160, 1140, 1120, 1100, 1080, 1060, 1040, 1020],
        after: [1050, 1040, 1030, 1020, 1010, 1000, 990, 980, 970, 960]
      }
    },
    recommendations: [
      "Focus on reducing energy consumption further by optimizing machine settings.",
      "Increase inspection efficiency to maintain quality at higher throughput.",
      "Implement predictive maintenance to avoid unexpected downtimes.",
      "Leverage cost savings to invest in automation upgrades."
    ],
    summaryReport:
      "The scenario improves energy efficiency by 15%, reduces defects by 40%, and achieves a modest increase in throughput. Cost optimization shows a 10% improvement, indicating balanced gains in all key metrics. Recommendations include fine-tuning machine settings and enhancing quality checks."
  },
  {
    id: 2,
    title: "Maximized Throughput with Controlled Quality",
    process: "welding_machine",
    parameters: [
      "welding_temperature",
      "joint_strength_index",
      "ambient_temperature",
      "humidity",
      "completion_time"
    ],
    objectives: {
      throughput: { target: 85, min: 76.5, max: 93.5 },
      defectRate: { target: 3.8, min: 3.4, max: 4.2 },
      energyConsumption: { target: 125, min: 113, max: 137 },
      costOptimization: { target: 1350, min: 1215, max: 1485 }
    },
    graphs: {
      throughput: {
        before: [60, 62, 65, 68, 70, 73, 75, 77, 80, 82],
        after: [76, 78, 80, 83, 85, 87, 89, 91, 93, 95]
      },
      defectRate: {
        before: [6, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3, 5.2, 5.1],
        after: [4.2, 4.1, 4, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3]
      },
      energyConsumption: {
        before: [140, 138, 136, 134, 132, 130, 128, 126, 124, 122],
        after: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111]
      },
      costOptimization: {
        before: [1500, 1480, 1460, 1440, 1420, 1400, 1380, 1360, 1340, 1320],
        after: [1370, 1360, 1350, 1340, 1330, 1320, 1310, 1300, 1290, 1280]
      },
      completionTime: {
        before: [18, 17.5, 17, 16.5, 16, 15.5, 15, 14.5, 14, 13.5],
        after: [16, 15.5, 15, 14.5, 14, 13.8, 13.7, 13.5, 13.2, 13]
      },
      pieChart: {
        labels: ["Energy Consumption", "Throughput", "Defect Rate", "Cost Optimization"],
        before: [35, 25, 20, 20],
        after: [30, 30, 20, 20]
      }
    },
    recommendations: [
      "Increase welding temperature by 3-5°C to improve joint strength index while maintaining defect rates below 4%.",
      "Reduce completion time by 10% (to below 14 minutes) to enhance throughput by up to 5%.",
      "Monitor ambient temperature and adjust within ±2°C to stabilize throughput and minimize defect rates by 8%.",
      "Maintain humidity levels at 45-55% to improve welding efficiency and decrease energy consumption by 5%.",
      "Utilize predictive algorithms to dynamically adjust welding parameters, reducing completion time variance by 12%.",
      "Automate joint inspection processes to achieve defect rates below 3.8% and reduce downtime by 15%.",
      "Optimize cost by lowering energy consumption by 10-12% using more efficient machine cycles, aligning with a target of 125 kWh."
    ],
    summaryReport:
      "This scenario demonstrates a 40% increase in throughput, with defect rates reduced by 44%. Completion time decreased by 10%, and energy consumption is reduced by 14%. Cost optimization shows a 15% improvement. Recommendations focus on precise parameter adjustments, automation, and environmental control to sustain these gains."
  }
  
  // Add other scenarios similarly, ensuring graphs and recommendations are consistent with realistic EV manufacturing process outcomes.
];



// Tolerance: now using the baked scenario objective ranges (±10% is baked in)
const checkForScenarioMatch = (th, dr, ec, cost) => {
  for (const scenario of bakedScenarios) {
    const obj = scenario.objectives;
    if (
      th >= obj.throughput.min &&
      th <= obj.throughput.max &&
      dr >= obj.defectRate.min &&
      dr <= obj.defectRate.max &&
      ec >= obj.energyConsumption.min &&
      ec <= obj.energyConsumption.max &&
      cost >= obj.costOptimization.min &&
      cost <= obj.costOptimization.max
    ) {
      return scenario;
    }
  }
  return null;
};
const generatePieChartData = (labels, beforeData, afterData) => {
  return {
    labels: labels,
    datasets: [
      {
        label: "Before Optimization",
        data: beforeData,
        backgroundColor: [
          "rgba(78, 115, 223, 0.5)",
          "rgba(28, 200, 138, 0.5)",
          "rgba(246, 194, 62, 0.5)",
          "rgba(231, 74, 59, 0.5)"
        ],
        borderColor: [
          "rgba(78, 115, 223, 1)",
          "rgba(28, 200, 138, 1)",
          "rgba(246, 194, 62, 1)",
          "rgba(231, 74, 59, 1)"
        ],
        borderWidth: 1,
      },
      {
        label: "After Optimization",
        data: afterData,
        backgroundColor: [
          "rgba(54, 185, 204, 0.5)",
          "rgba(246, 194, 62, 0.5)",
          "rgba(231, 74, 59, 0.5)",
          "rgba(90, 92, 105, 0.5)"
        ],
        borderColor: [
          "rgba(54, 185, 204, 1)",
          "rgba(246, 194, 62, 1)",
          "rgba(231, 74, 59, 1)",
          "rgba(90, 92, 105, 1)"
        ],
        borderWidth: 1,
      }
    ],
  };
};

// Sample chart data generator for react-chartjs-2
// Update generateChartData colors to match Volt React Themesberg template
const generateChartData = (dataBefore, dataAfter, label) => {
  return {
    labels: Array.from({ length: dataBefore.length }, (_, i) => i + 1),
    datasets: [
      {
        label: `${label} Before`,
        data: dataBefore,
        borderColor: "#4e73df", // Primary blue color from Volt React
        backgroundColor: "rgba(78, 115, 223, 0.1)",
        tension: 0.4,
      },
      {
        label: `${label} After`,
        data: dataAfter,
        borderColor: "#1cc88a", // Green for improvement
        backgroundColor: "rgba(28, 200, 138, 0.1)",
        tension: 0.4,
      },
      {
        label: `${label} Target`,
        data: dataAfter.map(() => (Math.max(...dataAfter) + Math.min(...dataAfter)) / 2),
        borderColor: "#f6c23e", // Yellow for targets
        backgroundColor: "rgba(246, 194, 62, 0.1)",
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };
};





function Optimization() {
  const [throughput, setThroughput] = useState(50);
  const [defectRate, setDefectRate] = useState(5);
  const [energyConsumption, setEnergyConsumption] = useState(100);
  const [costOptimization, setCostOptimization] = useState(1000);
  const [selectedProcess, setSelectedProcess] = useState("cell_prep");
  const [selectedParams, setSelectedParams] = useState([]);
  const [matchedScenario, setMatchedScenario] = useState(null);
  const chartRefs = useRef({});

  const handleParamChange = (param) => {
    setSelectedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  const handleOptimize = () => {
    const scenario = checkForScenarioMatch(
      throughput,
      defectRate,
      energyConsumption,
      costOptimization
    );
    setMatchedScenario(scenario);
  };

  const handlePrintPDF = () => {
    if (!matchedScenario) return;

    const doc = new jsPDF();
    let yPosition = 10;

    // Add Title
    doc.setFontSize(16);
    doc.text("Optimization Report", 10, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Scenario: ${matchedScenario.title}`, 10, yPosition);
    yPosition += 10;

    // Add Recommendations
    doc.text("Recommendations:", 10, yPosition);
    yPosition += 5;
    matchedScenario.recommendations.forEach((rec) => {
      doc.text(`- ${rec}`, 15, yPosition);
      yPosition += 5;
    });

    // Add Graphs
    for (const [key, value] of Object.entries(matchedScenario.graphs)) {
      const chartRef = chartRefs.current[key];
      if (chartRef) {
        const chartImage = chartRef.toBase64Image();
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(`${key} Graph:`, 10, yPosition);
        yPosition += 5;
        doc.addImage(chartImage, "PNG", 15, yPosition, 180, 100);
        yPosition += 105;
      }
    }

    doc.save("Optimization_Report.pdf");
  };

  return (
    <div className="optimization-page container mt-4">
      <h1 className="page-title">
        <FaCogs className="me-2" /> Process Optimization
      </h1>

      <Row className="gy-4">
        {/* Objectives (Slider) Section */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <FaTasks className="me-2 text-secondary" /> Objectives (Set values)
            </Card.Header>
            <Card.Body>
              {[
                { label: "Throughput", value: throughput, max: 100, unit: "units/hr", setter: setThroughput },
                { label: "Defect Rate", value: defectRate, max: 20, unit: "%", setter: setDefectRate },
                { label: "Energy Consumption", value: energyConsumption, max: 500, unit: "kWh", setter: setEnergyConsumption },
                { label: "Cost Optimization", value: costOptimization, max: 5000, unit: "$", setter: setCostOptimization },
              ].map((objective) => (
                <div className="mb-3" key={objective.label}>
                  <Form.Label>
                    {objective.label}: {objective.value} {objective.unit}
                  </Form.Label>
                  <ProgressBar
                    now={(objective.value / objective.max) * 100}
                    label={`${objective.value} ${objective.unit}`}
                  />
                  <Form.Range
                    min={0}
                    max={objective.max}
                    value={objective.value}
                    onChange={(e) => objective.setter(Number(e.target.value))}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Process Selection Section */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <FaChartBar className="me-2 text-secondary" /> Process / Parameters
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Process:</Form.Label>
                <Form.Select
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                >
                  {Object.keys(processFeatureMap).map((process) => (
                    <option key={process} value={process}>
                      {process}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="parameters-list">
                <p className="mb-2">Select Parameters to Optimize:</p>
                {processFeatureMap[selectedProcess].map((param) => (
                  <Form.Check
                    type="checkbox"
                    key={param}
                    label={param}
                    checked={selectedParams.includes(param)}
                    onChange={() => handleParamChange(param)}
                  />
                ))}
              </div>

              <Button variant="primary" className="mt-3" onClick={handleOptimize}>
                Optimize
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recommendations & Graphs Section */}
      <Row className="gy-4 mt-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <FaCheckCircle className="me-2 text-secondary" /> Recommendations
            </Card.Header>
            <Card.Body>
              {matchedScenario ? (
                <>
                  <h5>Scenario: {matchedScenario.title}</h5>
                  <h6>Process & Parameters:</h6>
                  <p>
                    <strong>Process:</strong> {matchedScenario.process}
                    <br />
                    <strong>Parameters:</strong> {matchedScenario.parameters.join(", ")}
                  </p>
                  <h6>Recommendations:</h6>
                  <ul>
                    {matchedScenario.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Recommendations based on optimization will appear here after clicking Optimize.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <FaChartBar className="me-2 text-secondary" /> Graphs
            </Card.Header>
            <Card.Body>
              {matchedScenario ? (
                Object.entries(matchedScenario.graphs).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <h6>{key}:</h6>
                    <Line
                      data={generateChartData(value.before, value.after, key)}
                      ref={(el) => (chartRefs.current[key] = el)}
                    />
                  </div>
                ))
              ) : (
                <p>Graphs showcasing before vs. after optimization will appear here after clicking Optimize.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Generate Report Button */}
      {matchedScenario && (
        <div className="text-center mt-4">
          <Button variant="outline-primary" onClick={handlePrintPDF}>
            <FaPrint className="me-2" /> Generate Report
          </Button>
        </div>
      )}
    </div>
  );
}

export default Optimization;
