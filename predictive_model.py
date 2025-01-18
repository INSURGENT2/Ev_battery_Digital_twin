import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
import shap
import joblib

class PredictiveMaintenanceModel:
    def __init__(self, process_name, features):
        """
        Initialize the model for a specific process.

        Args:
            process_name (str): Name of the process (e.g., 'cell_prep').
            features (list): List of feature column names for this process.
        """
        self.process_name = process_name
        self.features = features
        self.classification_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.regression_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.shap_explainer = None

    def train(self, X, y_failure, y_ttf):
        """ Train the classification and regression models for this process. """
        # Filter features for this process
        X_filtered = X[self.features]

        # Train classification model (Predicts if failure will occur)
        X_train, X_test, y_train, y_test = train_test_split(X_filtered, y_failure, test_size=0.2, random_state=42)
        self.classification_model.fit(X_train, y_train)

        # Train regression model (Predicts time to failure)
        X_train, X_test, y_train_ttf, y_test_ttf = train_test_split(X_filtered, y_ttf, test_size=0.2, random_state=42)
        self.regression_model.fit(X_train, y_train_ttf)

        # Generate SHAP explainer for explainability
        self.shap_explainer = shap.Explainer(self.classification_model, X_filtered)

        # Model evaluation
        y_pred = self.classification_model.predict(X_test)
        print(f"Classification Report for {self.process_name}:")
        print(classification_report(y_test, y_pred))

        y_pred_ttf = self.regression_model.predict(X_test)
        mse = mean_squared_error(y_test_ttf, y_pred_ttf)
        print(f"Mean Squared Error (Time-to-Failure) for {self.process_name}: {mse:.2f}")

    def predict(self, X):
        """ Predicts failure probability, time-to-failure, and high-risk status. """
        X_filtered = X[self.features]

        failure_probability = self.classification_model.predict_proba(X_filtered)[:, 1]  # Get probability of failure
        time_to_failure = self.regression_model.predict(X_filtered)  # Predict time-to-failure

        # Identify high-risk components (where probability > 0.7)
        high_risk_flags = failure_probability > 0.7

        return failure_probability, time_to_failure, high_risk_flags

    def explain_failure(self, X):
        """ Explains why a specific failure occurred for each row. """
        X_filtered = X[self.features]
        shap_values = self.shap_explainer(X_filtered)
        return shap_values

    def save_model(self, filename):
        """ Save the model to a file. """
        with open(filename, 'wb') as f:
            joblib.dump(self, f)

    @staticmethod
    def load_model(filename):
        """ Load the model from a file. """
        with open(filename, 'rb') as f:
            return joblib.load(f)
