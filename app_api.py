"""
Disease Prediction Flask API + Webapp
=======================================
Serves both traditional web interface AND REST API endpoints
for the Next.js React frontend.
"""

import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# ── Load model artifacts ──────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model", "disease_model.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "model", "label_encoder.pkl"))
symptom_columns = joblib.load(os.path.join(BASE_DIR, "model", "symptom_columns.pkl"))

# Load disease descriptions
desc_df = pd.read_csv(os.path.join(BASE_DIR, "symptom_Description_820_verified_v5.csv"))
desc_df.columns = desc_df.columns.str.strip()
# Build a dict: disease_name -> description
disease_descriptions = {}
for _, row in desc_df.iterrows():
    name = str(row.iloc[0]).strip().lower()
    desc = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else "No description available."
    disease_descriptions[name] = desc

# Clean symptom names for display
def format_symptom(s):
    """Convert column name to human-readable label."""
    return s.replace('_', ' ').replace('.', ' ').strip().title()

symptom_display = [
    {"value": s, "label": format_symptom(s)}
    for s in symptom_columns
]
# Sort alphabetically for easier browsing
symptom_display.sort(key=lambda x: x["label"])


# ═══════════════════════════════════════════════════════════════════
#  REST API ENDPOINTS (for Next.js frontend)
# ═══════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def api_health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "total_symptoms": len(symptom_columns),
        "total_diseases": len(label_encoder.classes_)
    })


@app.route("/api/symptoms", methods=["GET"])
def api_get_symptoms():
    """Return list of all available symptoms with display labels"""
    return jsonify({
        "symptoms": symptom_display,
        "total": len(symptom_display)
    })


@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    Predict disease from symptoms (REST API version)
    
    Request body:
    {
        "symptoms": ["fever", "cough", "headache"]
    }
    
    Response:
    {
        "predictions": [
            {
                "disease": "Common Cold",
                "confidence": 87.5,
                "description": "..."
            },
            ...
        ],
        "selected_symptoms": [...],
        "total_predictions": 3
    }
    """
    try:
        data = request.get_json()
        if not data or 'symptoms' not in data:
            return jsonify({"error": "Missing 'symptoms' in request body"}), 400
        
        selected = data.get('symptoms', [])
        
        if not selected:
            return jsonify({"error": "Please provide at least one symptom"}), 400

        # Build binary feature vector
        feature_vector = np.zeros(len(symptom_columns), dtype=np.int8)
        for i, col in enumerate(symptom_columns):
            if col in selected:
                feature_vector[i] = 1

        # Predict probabilities
        input_df = pd.DataFrame([feature_vector], columns=symptom_columns)
        probabilities = model.predict_proba(input_df)[0]

        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[::-1][:3]
        results = []
        for idx in top_indices:
            disease_name = label_encoder.inverse_transform([idx])[0]
            confidence = probabilities[idx] * 100
            desc_key = disease_name.strip().lower()
            description = disease_descriptions.get(
                desc_key, "No description available for this condition."
            )
            results.append({
                "disease": disease_name.title(),
                "confidence": round(confidence, 2),
                "description": description,
            })

        selected_labels = [format_symptom(s) for s in selected]

        return jsonify({
            "predictions": results,
            "selected_symptoms": selected_labels,
            "total_predictions": len(results)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
#  TRADITIONAL WEB ROUTES (existing Flask templates)
# ═══════════════════════════════════════════════════════════════════

@app.route("/")
def landing():
    return render_template("landing.html")


@app.route("/app")
def index():
    return render_template("index.html", symptoms=symptom_display)


@app.route("/predict", methods=["POST"])
def predict():
    selected = request.form.getlist("symptoms")

    if not selected:
        return render_template(
            "index.html",
            symptoms=symptom_display,
            error="Please select at least one symptom."
        )

    # Build binary feature vector
    feature_vector = np.zeros(len(symptom_columns), dtype=np.int8)
    for i, col in enumerate(symptom_columns):
        if col in selected:
            feature_vector[i] = 1

    # Predict probabilities
    input_df = pd.DataFrame([feature_vector], columns=symptom_columns)
    probabilities = model.predict_proba(input_df)[0]

    # Get top 3 predictions
    top_indices = np.argsort(probabilities)[::-1][:3]
    results = []
    for idx in top_indices:
        disease_name = label_encoder.inverse_transform([idx])[0]
        confidence = probabilities[idx] * 100
        desc_key = disease_name.strip().lower()
        description = disease_descriptions.get(
            desc_key, "No description available for this condition."
        )
        results.append({
            "name": disease_name.title(),
            "confidence": round(confidence, 2),
            "description": description,
        })

    selected_labels = [format_symptom(s) for s in selected]

    return render_template(
        "result.html",
        results=results,
        selected_symptoms=selected_labels,
    )


if __name__ == "__main__":
    print("\n  🏥  Disease Prediction API + Webapp")
    print("  ➜  Flask Backend:  http://127.0.0.1:5000")
    print("  ➜  Next.js Frontend: http://localhost:3000")
    print("  ➜  API Docs:       /api/health, /api/symptoms, /api/predict\n")
    app.run(debug=False, port=5000)
