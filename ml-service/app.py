
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import json
import os
from PIL import Image
import io
import base64
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Model paths
MODEL_PATH = 'models/densenet121_car_damage.keras'  # Use .keras format (new)
MODEL_PATH_H5 = 'models/densenet121_car_damage.h5'  # Fallback to .h5 (legacy)
CLASS_NAMES_PATH = 'models/class_names.json'
MODEL_METRICS_PATH = 'models/model_metrics.json'

# Global variables
model = None
class_names = []
model_metrics = {}

# Repair cost mapping (in USD)
REPAIR_COST_MAPPING = {
    'minor': {'min': 500, 'max': 2000, 'avg': 1250},
    'moderate': {'min': 2000, 'max': 8000, 'avg': 5000},
    'severe': {'min': 8000, 'max': 25000, 'avg': 16500}
}

def load_ml_model():
    """Load the trained model and class names"""
    global model, class_names, model_metrics

    try:
        logger.info("Loading model...")

        # Try loading .keras format first (recommended)
        if os.path.exists(MODEL_PATH):
            model = load_model(MODEL_PATH)
            logger.info(f"✓ Model loaded from {MODEL_PATH}")
        # Fallback to .h5 format
        elif os.path.exists(MODEL_PATH_H5):
            model = load_model(MODEL_PATH_H5)
            logger.info(f"✓ Model loaded from {MODEL_PATH_H5}")
        else:
            logger.error(f"❌ Model not found at {MODEL_PATH} or {MODEL_PATH_H5}")
            return False

        with open(CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
        logger.info(f"✓ Class names loaded: {class_names}")

        if os.path.exists(MODEL_METRICS_PATH):
            with open(MODEL_METRICS_PATH, 'r') as f:
                model_metrics = json.load(f)
            logger.info(f"✓ Model metrics loaded")

        return True
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        return False

def preprocess_image(img):
    """Preprocess image for model prediction"""
    try:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return None

def estimate_repair_cost(severity, confidence):
    """Estimate repair cost based on severity and confidence"""
    severity_key = severity.lower()
    cost_range = REPAIR_COST_MAPPING.get(severity_key, {'min': 1000, 'max': 5000, 'avg': 3000})

    confidence_factor = confidence / 100.0
    base_cost = cost_range['avg']

    if confidence_factor > 0.8:
        estimated_cost = base_cost
    else:
        variance = (cost_range['max'] - cost_range['min']) * (1 - confidence_factor) * 0.3
        estimated_cost = base_cost + np.random.uniform(-variance, variance)

    estimated_cost = np.clip(estimated_cost, cost_range['min'], cost_range['max'])

    return {
        'estimated_cost': round(float(estimated_cost), 2),
        'min_cost': cost_range['min'],
        'max_cost': cost_range['max'],
        'currency': 'USD',
        'confidence': round(confidence, 2)
    }

@app.route('/')
def home():
    """API home endpoint"""
    return jsonify({
        'service': 'AutoSureAI ML Microservice',
        'status': 'running',
        'version': '1.0.0',
        'model': 'DenseNet121',
        'classes': class_names,
        'endpoints': {
            'predict': '/predict (POST)',
            'health': '/health (GET)',
            'model_info': '/model-info (GET)'
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    model_loaded = model is not None
    return jsonify({
        'status': 'healthy' if model_loaded else 'unhealthy',
        'model_loaded': model_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info')
def model_info():
    """Get model information"""
    return jsonify({
        'model_type': 'DenseNet121',
        'classes': class_names,
        'num_classes': len(class_names),
        'input_shape': [224, 224, 3],
        'metrics': model_metrics,
        'repair_cost_ranges': REPAIR_COST_MAPPING
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict damage severity from uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400

        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))

        img_array = preprocess_image(img)
        if img_array is None:
            return jsonify({'error': 'Error preprocessing image'}), 400

        predictions = model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx] * 100)

        class_probabilities = {
            class_names[i]: float(predictions[0][i] * 100)
            for i in range(len(class_names))
        }

        cost_info = estimate_repair_cost(predicted_class, confidence)

        result = {
            'success': True,
            'prediction': {
                'severity': predicted_class,
                'confidence': round(confidence, 2),
                'class_probabilities': class_probabilities
            },
            'repair_cost': cost_info,
            'timestamp': datetime.now().isoformat()
        }

        socketio.emit('prediction_complete', result)

        logger.info(f"Prediction: {predicted_class} ({confidence:.2f}%)")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info('Client connected')
    emit('connection_response', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info('Client disconnected')

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("  AutoSureAI - ML Microservice (Phase 2)")
    print("="*70 + "\n")

    if not load_ml_model():
        print("❌ Failed to load model. Please train the model first.")
        print("   Run: python scripts/train_model.py")
        exit(1)

    print("\n✅ ML Service ready!")
    print(f"📊 Classes: {class_names}")
    print(f"\n🚀 Starting server...")
    print(f"   REST API: http://localhost:5000")
    print(f"   Socket.IO: ws://localhost:5000")
    print("\n" + "="*70 + "\n")

    socketio.run(app, host='0.0.0.0', port=5000, debug=True)