from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import cloudpickle
from predictive_model import PredictiveMaintenanceModel

# Load the pre-trained model using cloudpickle
with open('cell_prep_model_resaved.pkl', 'rb') as f:
    model = cloudpickle.load(f)

# Ensure the model has the features attribute
if not hasattr(model, 'features'):
    model.features = [
        'inspection_pass_rate', 'temperature', 'vibration_level', 'energy_consumption',
        'ambient_temperature', 'humidity', 'air_quality_index', 'completion_time',
        'process_yield', 'cycle_time', 'resource_utilization_rate', 'order_completion_time',
        'inspection_time', 'defect_rate', 'downtime_logged'
    ]

# Initialize Flask
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def generate_input(is_risky=None):
    """
    Helper function to generate input for the model.
    If is_risky is specified, it overrides random risk generation.
    """
    is_risky = np.random.choice([True, False]) if is_risky is None else is_risky
    return pd.DataFrame({
        'inspection_pass_rate': [np.random.uniform(80, 90) if is_risky else np.random.uniform(90, 100)],
        'temperature': [np.random.uniform(85, 95) if is_risky else np.random.uniform(70, 85)],
        'vibration_level': [np.random.uniform(0.6, 0.9) if is_risky else np.random.uniform(0.3, 0.5)],
        'energy_consumption': [np.random.uniform(50, 60)],
        'ambient_temperature': [np.random.uniform(30, 40) if is_risky else np.random.uniform(20, 25)],
        'humidity': [np.random.uniform(50, 60)],
        'air_quality_index': [np.random.uniform(70, 80) if is_risky else np.random.uniform(30, 40)],
        'completion_time': [np.random.uniform(50, 70) if is_risky else np.random.uniform(40, 50)],
        'process_yield': [np.random.uniform(80, 90) if is_risky else np.random.uniform(90, 100)],
        'cycle_time': [np.random.uniform(170, 190)],
        'resource_utilization_rate': [np.random.uniform(60, 80) if is_risky else np.random.uniform(90, 100)],
        'order_completion_time': [np.random.uniform(5, 10)],
        'inspection_time': [np.random.uniform(10, 15)],
        'defect_rate': [np.random.uniform(4, 8) if is_risky else np.random.uniform(1.5, 3.0)],
        'downtime_logged': [np.random.uniform(30, 50) if is_risky else np.random.uniform(20, 40)]
    })

@app.route('/predictive-data', methods=['GET', 'POST'])
def get_predictive_data():
    """
    Endpoint to provide predictive data.
    If a POST request is made with user-specified input, it processes the input.
    """
    if request.method == 'POST':
        input_data = request.get_json()
        if not input_data:
            return jsonify({"error": "No input data provided"}), 400

        new_input = pd.DataFrame([input_data])
    else:
        new_input = generate_input()

    new_input = new_input.reindex(columns=model.features, fill_value=0)
    failure_proba, ttf, high_risk = model.predict(new_input)
    notification = "High risk of failure detected! Immediate action is recommended." if any(high_risk) else "No immediate risks."

    response = {
        "input_data": new_input.to_dict(orient='records')[0],
        "failure_probability": failure_proba.tolist(),
        "time_to_failure": ttf.tolist(),
        "high_risk": high_risk.tolist(),
        "notification": notification
    }
    return jsonify(response)

@app.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """
    Endpoint to provide data for the Dashboard.
    Simulates key performance metrics and risk levels.
    """
    new_input = generate_input()
    new_input = new_input.reindex(columns=model.features, fill_value=0)
    failure_proba, ttf, high_risk = model.predict(new_input)
    notification = "High risk detected!" if any(high_risk) else "System operating within safe limits."

    dashboard_metrics = {
        "throughput": f"{np.random.uniform(180, 200):.2f} units/h",
        "defect_rate": f"{new_input['defect_rate'][0]:.2f}%",
        "energy_consumption": f"{new_input['energy_consumption'][0]:.2f} kWh",
        "thermal_uniformity": f"{np.random.uniform(95, 100):.2f}%",
        "assembly_precision": f"{np.random.uniform(99, 100):.2f}%",
        "notification": notification
    }
    return jsonify(dashboard_metrics)

@app.route('/optimization-data', methods=['GET'])
def get_optimization_data():
    """
    Endpoint to provide data for the Optimization component.
    Generates optimization recommendations based on risk analysis.
    """
    new_input = generate_input()
    new_input = new_input.reindex(columns=model.features, fill_value=0)
    failure_proba, ttf, high_risk = model.predict(new_input)

    optimization_metrics = {
        "current_settings": {
            "welding_temperature": f"{np.random.uniform(480, 520):.2f}°C",
            "stacking_speed": f"{np.random.uniform(130, 150):.2f} mm/s",
            "energy_consumption": f"{new_input['energy_consumption'][0]:.2f} kWh",
            "thermal_uniformity": f"{np.random.uniform(90, 100):.2f}%"
        },
        "optimization_goals": {
            "throughput": f"Target: {np.random.uniform(190, 210):.2f} units/h",
            "defect_rate": f"Target: < {np.random.uniform(0.5, 1):.2f}%",
            "energy_consumption": f"Target: < {np.random.uniform(80, 90):.2f} kWh"
        },
        "recommended_adjustments": [
            "Decrease welding temperature to 480°C",
            "Increase stacking speed to 145 mm/s",
            "Target energy consumption of 90 kWh",
            "Improve thermal uniformity to 95%"
        ],
        "notification": "Optimization required due to high-risk indicators!" if any(high_risk) else "Settings are optimized."
    }
    return jsonify(optimization_metrics)

@app.route('/what-if-analysis', methods=['POST'])
def run_what_if_analysis():
    """
    Endpoint for What-If Analysis.
    Accepts user-specified parameters and returns model predictions and analysis.
    """
    input_data = request.get_json()
    if not input_data:
        return jsonify({"error": "No input data provided"}), 400

    new_input = pd.DataFrame([input_data])
    new_input = new_input.reindex(columns=model.features, fill_value=0)
    failure_proba, ttf, high_risk = model.predict(new_input)

    response = {
        "input_data": new_input.to_dict(orient='records')[0],
        "failure_probability": failure_proba.tolist(),
        "time_to_failure": ttf.tolist(),
        "high_risk": high_risk.tolist(),
        "notification": "High risk of failure detected! Adjust parameters!" if any(high_risk) else "Parameters are within safe range."
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
