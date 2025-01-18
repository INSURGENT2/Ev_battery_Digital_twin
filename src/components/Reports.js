import React, { useRef, useState } from "react";
import { Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import { FaPrint } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Mock data for multiple reports
const mockReportsData = [
  {
    id: "optimization_report_cell_prep",
    title: "Optimization Report - Cell Prep",
    date: "2025-01-18",
    graphs: {
      throughput: {
        before: [50, 51, 49, 52, 50, 51, 48, 50, 51, 49],
        after: [65, 68, 70, 71, 72, 72, 71, 73, 72, 71],
      },
      defectRate: {
        before: [5.2, 5.0, 5.3, 4.9, 5.1, 5.4, 5.2, 5.0, 5.2, 5.1],
        after: [4.5, 4.3, 4.2, 4.0, 4.0, 4.1, 4.0, 3.9, 4.0, 4.1],
      },
    },
    recommendations: [
      "Implement automated quality inspection system.",
      "Schedule preventive maintenance.",
      "Monitor energy consumption patterns.",
      "Establish regular calibration schedule for critical equipment.",
    ],
    summaryReport:
      "Successfully achieved balanced optimization with throughput increasing from ~50 to 72 units/hr while reducing defects from 5.1% to 4.0%.",
  },
];

// Chart Data Generator
const generateChartData = (dataBefore, dataAfter, label) => {
  return {
    labels: Array.from({ length: dataBefore.length }, (_, i) => i + 1),
    datasets: [
      {
        label: `${label} Before`,
        data: dataBefore,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
      {
        label: `${label} After`,
        data: dataAfter,
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        tension: 0.4,
      },
    ],
  };
};

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const chartRefs = useRef({});

  const handlePrintPDF = async () => {
    if (!selectedReport) return;

    const doc = new jsPDF();
    let yPosition = 10;

    // Add Title
    doc.setFontSize(16);
    doc.text(selectedReport.title, 10, yPosition);
    yPosition += 10;

    // Add Date
    doc.setFontSize(12);
    doc.text(`Date: ${selectedReport.date}`, 10, yPosition);
    yPosition += 10;

    // Add Recommendations
    doc.text("Recommendations:", 10, yPosition);
    yPosition += 5;
    selectedReport.recommendations.forEach((rec) => {
      doc.text(`- ${rec}`, 15, yPosition);
      yPosition += 5;
    });

    // Add Summary
    yPosition += 5;
    doc.text("Summary:", 10, yPosition);
    yPosition += 5;
    doc.text(selectedReport.summaryReport, 15, yPosition);
    yPosition += 10;

    // Add Graphs
    for (const [key, value] of Object.entries(selectedReport.graphs)) {
      const chartRef = chartRefs.current[key];
      if (chartRef) {
        const chartImage = chartRef.toBase64Image(); // Get Base64 image of the chart
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

    doc.save(`${selectedReport.id}.pdf`);
  };

  return (
    <div className="reports-page container mt-4">
      <h1 className="page-title text-center mb-4">Reports</h1>

      {!selectedReport ? (
        <div>
          <h5>Select a report to view:</h5>
          <ListGroup>
            {mockReportsData.map((report) => (
              <ListGroupItem
                key={report.id}
                action
                onClick={() => setSelectedReport(report)}
              >
                <strong>{report.title}</strong> <br />
                <small>Date: {report.date}</small>
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      ) : (
        <div>
          <Button
            variant="secondary"
            className="mb-3"
            onClick={() => setSelectedReport(null)}
          >
            Back to Report Selection
          </Button>

          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <strong>{selectedReport.title}</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Recommendations:</h6>
                <ul>
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <h6>Graphs:</h6>
                {Object.entries(selectedReport.graphs).map(([key, value], idx) => (
                  <div key={idx} className="mb-4">
                    <h6>{key}:</h6>
                    <Line
                      data={generateChartData(value.before, value.after, key)}
                      ref={(el) => {
                        chartRefs.current[key] = el; // Store chart references
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <h6>Summary:</h6>
                <p>{selectedReport.summaryReport}</p>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={handlePrintPDF}>
              <FaPrint className="me-2" />
              Print as PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
