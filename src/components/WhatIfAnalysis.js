import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ListGroup,
  ListGroupItem,
  ProgressBar,
} from "react-bootstrap";
import {
  FaChartBar,
  FaCogs,
  FaTasks,
  FaCheckCircle,
  FaBalanceScale,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
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
import "../styles/WhatIfAnalysis.css";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Process feature map with a note for units.
 * (Units can be shown in the explanation. For example:
 * - Temperature: °C
 * - Vibration Level: mm/s
 * - Energy Consumption: kWh, etc.)
 */
const process_feature_map = {
  cell_prep: [
    "inspection_pass_rate (%)",
    "temperature (°C)",
    "vibration_level (mm/s)",
    "energy_consumption (kWh)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  cell_stack: [
    "alignment_accuracy (%)",
    "stacking_speed (m/s)",
    "alignment_error (mm)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  welding_machine: [
    "welding_temperature (°C)",
    "joint_strength_index",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  thermal_installer: [
    "application_pressure (bar)",
    "temperature_of_thermal_material (°C)",
    "application_speed (m/s)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  frame_assembly: [
    "assembly_force (N)",
    "structural_integrity_check (%)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  busbar_installer: [
    "connection_quality_rating",
    "current_drawn (A)",
    "installation_duration (min)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  bms_installer: [
    "installation_time (min)",
    "fault_detection (yes/no)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
  eol_test: [
    "voltage_output (V)",
    "temperature_during_test (°C)",
    "ambient_temperature (°C)",
    "humidity (%)",
    "air_quality_index (AQI)",
    "completion_time (min)",
    "process_yield (%)",
    "cycle_time (s)",
    "resource_utilization_rate (%)",
    "order_completion_time (min)",
    "inspection_time (s)",
    "defect_rate (%)",
    "downtime_logged (min)",
  ],
};

/**
 * Checks if the scenario matches a premade baked-in scenario.
 * Returns an object with specialized simulation parameters (if matched)
 * or null if no match.
 *
 * The following scenarios are defined:
 *
 * 1. Overheated Welding Scenario (for welding machines and related processes):
 *    - *welding_temperature (°C)* must be above 100°C.
 *    - *ambient_temperature (°C)* should be above 40°C.
 *    - *humidity (%)* must be above 70%.
 *
 * 2. Process-wide Overload (applies across multiple processes):
 *    - *temperature (°C)* from cell_prep or similar should be over 90°C.
 *    - *energy_consumption (kWh)* over 80.
 *    - Additionally, if any process shows a high *cycle_time (s)* over 90.
 *
 * 3. Optimized Efficiency:
 *    - Every parameter in the scenario is within the optimal range: 40–60.
 *
 * 4. Mixed Performance Scenario:
 *    - At least two parameters with values above 80.
 *    - And at least two parameters with values below 20.
 */
const checkForPredefinedScenario = (scenario) => {
  // Convert the parameter list into an object keyed by the parameter's name without units.
  const scenarioParams = {};
  scenario.paramList.forEach((p) => {
    // Remove units info for key matching: for example "temperature (°C)" becomes "temperature"
    const key = p.param.split(" ")[0];
    scenarioParams[key] = p.value;
  });

  // 1. Overheated Welding Scenario:
  if (
    scenarioParams["welding_temperature"] &&
    scenarioParams["welding_temperature"] > 80  &&
    scenarioParams["ambient_temperature"] &&
    scenarioParams["ambient_temperature"] > 40 &&
    scenarioParams["humidity"] &&
    scenarioParams["humidity"] > 70
  ) {
    return {
      name: "Overheated Welding Scenario",
      failureProbability: 0.93,
      timeToFailure: 12,
      detailedReason:
        "This scenario indicates that the welding machine is operating under extreme thermal stress. The welding temperature is above 100°C while the ambient temperature exceeds 40°C and humidity is high (>70%). This combination increases the risk of material instability and critical failure, leading to a failure probability of 93% and a time-to-failure of approximately 12 minutes.",
    };
  }

  // 2. Process-wide Overload:
  if (
    scenarioParams["temperature"] &&
    scenarioParams["temperature"] > 90 &&
    scenarioParams["energy_consumption"] &&
    scenarioParams["energy_consumption"] > 80 &&
    scenarioParams["cycle_time"] &&
    scenarioParams["cycle_time"] > 90
  ) {
    return {
      name: "Process-wide Overload",
      failureProbability: 0.95,
      timeToFailure: 10,
      detailedReason:
        "This scenario is identified as a process-wide overload. High temperature (>90°C) combined with high energy consumption (>80 kWh) and a very long cycle time (>90s) creates a severe operational bottleneck. The system is under enormous stress, causing nearly certain failure (95% probability) within about 10 minutes.",
    };
  }

  // 3. Optimized Efficiency Scenario:
  let allOptimal = scenario.paramList.every(
    (p) => p.value >= 40 && p.value <= 60
  );
  if (allOptimal) {
    return {
      name: "Optimized Efficiency",
      failureProbability: 0.10,
      timeToFailure: 55,
      detailedReason:
        "All measured parameters are maintained within the optimal range (40–60). This fine-tuned setup minimizes stress and maximizes efficiency, resulting in a low failure probability of only 10% and an extended time-to-failure of approximately 55 minutes.",
    };
  }

  // 4. Mixed Performance Scenario:
  let highCount = scenario.paramList.filter((p) => p.value > 80).length;
  let lowCount = scenario.paramList.filter((p) => p.value < 20).length;
  if (highCount >= 2 && lowCount >= 2) {
    return {
      name: "Mixed Performance Scenario",
      failureProbability: 0.70,
      timeToFailure: 25,
      detailedReason:
        "This scenario shows a conflicting setup with several parameters indicating over-stress (values >80) and others indicating under-performance (values <20). The combination of these extremes results in an unpredictable overall performance with a moderate risk of failure (70%) and a time-to-failure around 25 minutes.",
    };
  }

  return null;
};

/**
 * Simulation function for a scenario.
 * It first checks whether the scenario matches a predefined (baked-in) one.
 * If matched, it returns its specialized values. Otherwise, it computes base simulation metrics.
 */
const simulateScenario = (scenario) => {
  const predefined = checkForPredefinedScenario(scenario);
  if (predefined) {
    const simulationText = {
      failureProbability: (predefined.failureProbability * 100).toFixed(0) + "%",
      timeToFailure: predefined.timeToFailure.toFixed(1) + " minutes",
      reason: `Premade Scenario Detected: ${predefined.name}\n\nDetailed Explanation:\n${predefined.detailedReason}`,
    };
    return simulationText;
  }

  // Default simulation calculation (if no predefined scenario is triggered)
  let sum = 0;
  scenario.paramList.forEach((p) => {
    sum += p.value;
  });
  const avg = sum / scenario.paramList.length;

  // Base failure probability is proportional to average value.
  let failureProbability = avg / 100; // e.g., avg=70 gives 70%
  // Add adjustments based on specific parameter names (ignoring unit text).
  const tempAdj = scenario.paramList.some((p) =>
    p.param.toLowerCase().includes("temperature")
  )
    ? 0.1
    : 0;
  const vibAdj = scenario.paramList.some((p) =>
    p.param.toLowerCase().includes("vibration")
  )
    ? 0.1
    : 0;
  failureProbability += tempAdj + vibAdj;
  if (failureProbability > 0.95) failureProbability = 0.95; // cap
  if (failureProbability < 0.05) failureProbability = 0.05; // floor

  // Estimated time to failure is calculated based on the average.
  let timeToFailure = 60 - avg * 0.5;
  if (timeToFailure < 10) timeToFailure = 10;
  if (timeToFailure > 60) timeToFailure = 60;

  // Detailed explanation includes units for each parameter.
  let reason = "Detailed Failure Analysis:\n";
  scenario.paramList.forEach((p) => {
    let comment = "";
    if (p.value > 70) comment = "high value (may indicate stress)";
    else if (p.value < 30) comment = "low value (may indicate under-performance)";
    else comment = "optimal range";
    reason += `- ${p.param}: ${p.value} (${comment})\n`;
  });
  reason +=
    "\nThe overall failure probability is computed by considering the average stress, with extra risk adjustments for temperature and vibration parameters. In general, a higher average results in higher risk and a shorter time-to-failure.";

  return {
    failureProbability: (failureProbability * 100).toFixed(0) + "%",
    timeToFailure: timeToFailure.toFixed(1) + " minutes",
    reason: reason,
  };
};

/**
 * Compare selected scenarios.
 * It runs simulation on each scenario, extracts key metrics, and produces a detailed comparison report.
 */
const compareScenarios = (scenarios) => {
  // Run simulation on each scenario.
  const results = scenarios.map((sc) => {
    const sim = simulateScenario(sc);
    // Extract numeric parts.
    const failureNumeric = parseInt(sim.failureProbability);
    const timeNumeric = parseFloat(sim.timeToFailure);
    return { name: sc.name, failureNumeric, timeNumeric, sim };
  });

  // Sort by failure risk (lower is better) and time-to-failure (higher is better).
  const sortedByRisk = [...results].sort(
    (a, b) => a.failureNumeric - b.failureNumeric
  );
  const sortedByTime = [...results].sort((a, b) => b.timeNumeric - a.timeNumeric);

  let text = "Comparison Report:\n\n";
  text += "Individual Scenario Metrics:\n";
  results.forEach((r) => {
    text += `- ${r.name}: Failure Probability = ${r.failureNumeric}%, Time-to-Failure = ${r.timeNumeric} minutes\n`;
  });
  text += "\nOverall Best in Terms of Failure Risk: " + sortedByRisk[0].name + "\n";
  text += "Overall Best in Terms of Longevity: " + sortedByTime[0].name + "\n\n";

  // Provide tradeoff commentary:
  text += "Trade-Off Analysis:\n";
  if (sortedByRisk[0].name === sortedByTime[0].name) {
    text += `The scenario "${sortedByRisk[0].name}" performs best on both metrics. It offers a low failure probability and the longest time-to-failure.`;
  } else {
    text += `While "${sortedByRisk[0].name}" has the lowest failure probability, "${sortedByTime[0].name}" offers the longest time before failure. Depending on whether immediate risk reduction or extended operating time is the priority, the optimal choice may vary. Consider tuning parameters to achieve a better balance.`;
  }

  return text;
};

function WhatIfAnalysis() {
  // Current process chosen.
  const [selectedProcess, setSelectedProcess] = useState("cell_prep");

  // Scenario in progress (parameters chosen for the scenario).
  const [scenarioInProgress, setScenarioInProgress] = useState([]);
  const [scenarioName, setScenarioName] = useState("");

  // For parameter selection from the current process.
  const [selectedParams, setSelectedParams] = useState([]);
  const [paramValues, setParamValues] = useState({});

  // Queue of finalized scenarios.
  const [scenarioQueue, setScenarioQueue] = useState([]);

  // Simulation or comparison insights.
  const [scenarioInsights, setScenarioInsights] = useState(null);

  // Toggle parameter checkbox.
  const handleParamToggle = (param) => {
    setSelectedParams((prev) => {
      if (prev.includes(param)) {
        return prev.filter((p) => p !== param);
      } else {
        return [...prev, param];
      }
    });
    setParamValues((prev) => ({
      ...prev,
      [param]: prev[param] ?? 50,
    }));
  };

  // Slider change for parameter value.
  const handleParamSlider = (param, val) => {
    setParamValues((prev) => ({
      ...prev,
      [param]: Number(val),
    }));
  };

  // Add chosen parameters into the scenario in progress.
  const handleAddParamsToScenario = () => {
    if (selectedParams.length === 0) {
      alert("No parameters selected!");
      return;
    }
    const newEntries = selectedParams.map((p) => ({
      process: selectedProcess,
      param: p,
      value: paramValues[p] ?? 50,
    }));
    setScenarioInProgress((prev) => [...prev, ...newEntries]);
    // Clear for next selection.
    setSelectedParams([]);
    setParamValues({});
  };

  // Finalize current scenario and add to the queue.
  const handleAddScenarioToQueue = () => {
    if (!scenarioName.trim()) {
      alert("Please enter a scenario name!");
      return;
    }
    if (scenarioInProgress.length === 0) {
      alert("No parameters in the scenario!");
      return;
    }
    const newScenario = {
      name: scenarioName,
      paramList: scenarioInProgress.map((entry) => ({ ...entry })),
      selected: false,
    };
    setScenarioQueue((prev) => [...prev, newScenario]);
    // Reset in-progress scenario and scenario name.
    setScenarioInProgress([]);
    setScenarioName("");
  };

  // Toggle scenario selection in the queue.
  const toggleScenarioSelected = (index) => {
    setScenarioQueue((prev) =>
      prev.map((scenario, i) =>
        i === index ? { ...scenario, selected: !scenario.selected } : scenario
      )
    );
    setScenarioInsights(null);
  };

  // Compare selected scenarios (requires at least 2 selected).
  const handleCompareSelected = () => {
    const selected = scenarioQueue.filter((sc) => sc.selected);
    if (selected.length < 2) {
      alert("Select at least 2 scenarios to compare!");
      return;
    }
    console.log("Comparing scenarios:", selected);
    const comparisonText = compareScenarios(selected);
    setScenarioInsights(comparisonText);
  };

  // Simulate exactly one scenario.
  const handleSimulateScenario = () => {
    const selected = scenarioQueue.filter((sc) => sc.selected);
    if (selected.length !== 1) {
      alert("Please select exactly 1 scenario to simulate!");
      return;
    }
    const scenario = selected[0];
    console.log("Simulating scenario:", scenario);

    const simulationResults = simulateScenario(scenario);
    const simulationText = `
Simulation Results for "${scenario.name}":
- Failure Probability: ${simulationResults.failureProbability}
- Estimated Time-to-Failure: ${simulationResults.timeToFailure}
- Detailed Explanation:
${simulationResults.reason}
    `;
    setScenarioInsights(simulationText);
  };

  return (
    <Container fluid className="whatif-container mt-4">
      <h1 className="page-title text-center mb-4">
        <FaCogs className="me-2" />
        What-If Analysis
      </h1>

      <Row className="gy-4">
        {/* Scenario Configuration (Left) */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="header-title">
              <FaTasks className="me-2" />
              Scenario Configuration
            </Card.Header>
            <Card.Body>
              {/* Process Selection */}
              <Form.Group className="mb-3">
                <Form.Label>Process:</Form.Label>
                <Form.Select
                  value={selectedProcess}
                  onChange={(e) => {
                    setSelectedProcess(e.target.value);
                    setSelectedParams([]);
                    setParamValues({});
                  }}
                >
                  {Object.keys(process_feature_map).map((pKey) => (
                    <option key={pKey} value={pKey}>
                      {pKey}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Parameter Choices */}
              <div className="mb-3">
                <Form.Label>
                  Pick parameters from <strong>{selectedProcess}</strong>:
                </Form.Label>
                <div className="param-choices border rounded p-2 bg-light">
                  {process_feature_map[selectedProcess].map((param) => (
                    <Form.Check
                      className="mb-1"
                      type="checkbox"
                      key={param}
                      label={param}
                      checked={selectedParams.includes(param)}
                      onChange={() => handleParamToggle(param)}
                    />
                  ))}
                </div>
              </div>

              {/* Sliders for selected parameters */}

              {selectedParams.length > 0 && (
                <div className="mb-3 param-sliders border rounded p-2 bg-light">
                  <Form.Label>Set parameter values:</Form.Label>
                  {selectedParams.map((p) => (
                    <div key={p} className="mb-3">
                      <Form.Label>
                        {p}: {paramValues[p] ?? 50}
                      </Form.Label>
                      <ProgressBar
                        now={paramValues[p] ?? 50}
                        label={`${paramValues[p] ?? 50}`}
                      />
                      <Form.Range
                        min={0}
                        max={100}
                        value={paramValues[p] ?? 50}
                        onChange={(e) => handleParamSlider(p, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
              

              <Button variant="primary" onClick={handleAddParamsToScenario} className="me-2">
                Add Param(s)
              </Button>

              {/* Scenario In-Progress */}
              <Card className="mt-3">
                <Card.Header className="inprogress-header">
                  In-Progress Parameters
                </Card.Header>
                <Card.Body>
                  {scenarioInProgress.length === 0 ? (
                    <p>No parameters added yet.</p>
                  ) : (
                    <ListGroup variant="flush">
                      {scenarioInProgress.map((item, idx) => (
                        <ListGroupItem key={idx}>
                          <strong>{item.process}</strong> - {item.param}: {item.value}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>

              {/* Scenario Name & Finalize */}
              <Form.Group className="mt-3 mb-2">
                <Form.Label>Scenario Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                />
              </Form.Group>

              <Button variant="success" onClick={handleAddScenarioToQueue}>
                Add Scenario to Queue
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Scenario Queue (Right) */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="header-title">
              <FaChartBar className="me-2" />
              Scenario Queue
            </Card.Header>
            <Card.Body>
              {scenarioQueue.length === 0 ? (
                <p>No scenarios in queue.</p>
              ) : (
                scenarioQueue.map((sc, idx) => (
                  <Card key={idx} className="mb-3">
                    <Card.Body>
                      <Form.Check
                        type="checkbox"
                        id={`scenario-${idx}`}
                        label={<strong>{sc.name}</strong>}
                        checked={sc.selected}
                        onChange={() => toggleScenarioSelected(idx)}
                        className="mb-2"
                      />
                      <ListGroup variant="flush">
                        {sc.paramList.map((pObj, i2) => (
                          <ListGroupItem key={i2} className="ps-4">
                            {pObj.process}: {pObj.param} = {pObj.value}
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comparisons & Insights */}
      <Row className="gy-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="header-title">
              <FaBalanceScale className="me-2" />
              Scenario Comparisons & Insights
            </Card.Header>
            <Card.Body>
              {scenarioInsights && (
                <div className="mb-3 p-3 bg-light border rounded">
                  <h5 className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    Insights
                  </h5>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{scenarioInsights}</pre>
                </div>
              )}
              <div className="d-flex gap-2">
                <Button variant="outline-primary" onClick={handleCompareSelected}>
                  Compare Selected
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <div className="d-flex flex-column gap-3">
            <Button variant="warning" onClick={handleSimulateScenario}>
              Simulate Scenario
            </Button>
            <Button variant="outline-secondary">Report</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default WhatIfAnalysis;
