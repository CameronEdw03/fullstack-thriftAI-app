from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
import joblib
import pandas as pd
import io
import os

# Load trained model
model = joblib.load("thrift_model.pkl")

app = Flask(__name__)
CORS(app)

# Store prediction history
history_data = []

# Initialize Google Vision client once
try:
    client = vision.ImageAnnotatorClient()
except Exception as e:
    print("Error initializing Google Vision client:", e)
    client = None

@app.route("/")
def home():
    return "Thrift Price Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    required_fields = ["brand", "category", "condition", "retail_price"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    df = pd.DataFrame([data])

    try:
        prediction = model.predict(df)[0]

        history_data.append({
            "brand": data["brand"],
            "category": data["category"],
            "condition": data["condition"],
            "retail_price": data["retail_price"],
            "predicted_price": round(prediction, 2)
        })

        return jsonify({"predicted_resale_price": round(prediction, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/history", methods=["GET"])
def history():
    return jsonify(history_data)

@app.route("/analyze", methods=["POST"])
def analyze_image():
    if client is None:
        return jsonify({"error": "Google Vision client not initialized"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        content = file.read()
        if not content:
            return jsonify({"error": "File is empty"}), 400

        image = vision.Image(content=content)
        response = client.label_detection(image=image)
        if response.error.message:
            return jsonify({"error": response.error.message}), 500

        labels = response.label_annotations
        result = [{"description": label.description, "score": label.score} for label in labels]

        return jsonify({"labels": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
