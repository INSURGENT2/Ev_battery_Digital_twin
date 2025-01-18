import pandas as pd
import cloudpickle
from predictive_model import PredictiveMaintenanceModel
# Load the model
with open('cell_prep_model_resaved.pkl', 'rb') as f:
    model = cloudpickle.load(f)

# Define the input data
new_input = pd.DataFrame({
    'inspection_pass_rate': [93],
    'temperature': [115],
    'vibration_level': [0.41],
    'energy_consumption': [52],
    'ambient_temperature': [21],
    'humidity': [56],
    'air_quality_index': [35],
    'completion_time': [45],
    'process_yield': [95],
    'cycle_time': [80],
    'resource_utilization_rate': [94],
    'order_completion_time': [7],
    'inspection_time': [12],
    'defect_rate': [1.8],
    'downtime_logged': [26]
})
# Align input with model features
new_input = new_input.reindex(columns=model.features, fill_value=0)

# Make predictions
failure_proba, ttf, high_risk = model.predict(new_input)

# Print predictions
print("Input Data:", new_input.to_dict(orient='records')[0])
print(f"Failure Probability: {failure_proba}")
print(f"Time-to-Failure: {ttf} minutes")
print(f"High Risk: {high_risk}")
