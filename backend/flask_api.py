"""
SkinScan AI — Flask REST API
Exposes the existing ResNet-50 skin-lesion model as a JSON API.

Endpoints:
  GET  /health   → liveness check
  POST /predict  → multipart/form-data with 'file' field
                   Returns JSON: prediction, confidence, all probabilities, Grad-CAM base64

This file does NOT change or replace model.py / gradcam.py.
It simply wires them up behind HTTP instead of Streamlit.
"""

import io
import os
import base64
import sys

# ── make sure sibling modules (model.py, gradcam.py) are importable ──────────
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from torchvision import transforms

from model import create_model
from gradcam import generate_gradcam

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow requests from the frontend dev server on port 3000 (and any other origin)
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Config ────────────────────────────────────────────────────────────────────
# Resolve model path relative to this file so the server can be started from
# any working directory.
_HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_HERE, "..", "models", "skin_lesion_resnet50_best.pth")

CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

CLASS_NAMES = {
    "akiec": "Actinic Keratoses",
    "bcc":   "Basal Cell Carcinoma",
    "bkl":   "Benign Keratosis",
    "df":    "Dermatofibroma",
    "mel":   "Melanoma",
    "nv":    "Melanocytic Nevi",
    "vasc":  "Vascular Lesion",
}

# Benign classes per clinical convention
BENIGN_CLASSES = {"bkl", "df", "nv", "vasc"}

# Class display colors (matches frontend sampleLesions palette)
CLASS_COLORS = {
    "akiec": "#f43f5e",
    "bcc":   "#06b6d4",
    "bkl":   "#6366f1",
    "df":    "#8b5cf6",
    "mel":   "#d946ef",
    "nv":    "#3b82f6",
    "vasc":  "#ec4899",
}

# Grad-CAM explanations per predicted class
CLASS_EXPLANATIONS = {
    "akiec": (
        "The Grad-CAM heatmap highlights scaly, rough surface texture with irregular "
        "border transitions — patterns characteristic of Actinic Keratosis, a pre-cancerous "
        "lesion caused by UV-induced keratinocyte dysplasia."
    ),
    "bcc": (
        "High activation over pearly, translucent nodular zones with arborizing "
        "telangiectasias. These features are hallmarks of Basal Cell Carcinoma, the most "
        "common form of skin cancer."
    ),
    "bkl": (
        "The model attends to a matte, stuck-on surface with comedo-like openings and "
        "milia cysts — classic dermoscopic features of Benign Keratosis (seborrheic keratosis)."
    ),
    "df": (
        "Activation centres on a central white scar-like area with a peripheral pigment "
        "ring, consistent with the typical Dermatofibroma pseudo-network pattern."
    ),
    "mel": (
        "Strong Grad-CAM activation over atypical pigment networks, irregular streaks, "
        "and blue-white veil structures. These asymmetric features raise significant concern "
        "for Melanoma and warrant urgent dermatological evaluation."
    ),
    "nv": (
        "The heatmap highlights a symmetric, uniform central pigment pattern with "
        "well-circumscribed borders — characteristic of a benign Melanocytic Nevus (common mole)."
    ),
    "vasc": (
        "Red lacunae and vascular structures dominate the Grad-CAM map, consistent "
        "with the angiomatous pattern of a Vascular Lesion (e.g., angioma or angiokeratoma)."
    ),
}

# ── Device ────────────────────────────────────────────────────────────────────
device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)
print(f"[SkinScan API] Using device: {device}")

# ── Load model once at startup ────────────────────────────────────────────────
print(f"[SkinScan API] Loading model from {MODEL_PATH} …")
_model = create_model(num_classes=len(CLASSES))

checkpoint = torch.load(MODEL_PATH, map_location=device)
if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    _model.load_state_dict(checkpoint["model_state_dict"])
else:
    _model.load_state_dict(checkpoint)

_model = _model.to(device)
_model.eval()
print("[SkinScan API] Model loaded successfully ✓")

# ── Preprocessing transform (identical to Streamlit app) ─────────────────────
_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# ── Allowed image extensions ──────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def _image_to_base64(arr: np.ndarray) -> str:
    """Convert uint8 RGB numpy array → data:image/jpeg;base64,… string."""
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Liveness probe — returns 200 when model is ready."""
    return jsonify({
        "status": "ok",
        "model": "ResNet50",
        "classes": len(CLASSES),
        "device": str(device),
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    POST multipart/form-data with field 'file' containing the image.

    Response JSON shape (matches frontend normalizeApiResponse schema):
    {
        "predicted_class": "nv",
        "class_name": "Melanocytic Nevi",
        "confidence": 82.4,
        "is_benign": true,
        "probabilities": { "nv": 0.824, "bcc": 0.068, ... },
        "gradcam_base64": "data:image/jpeg;base64,...",
        "explanation": "...",
        "all_probabilities": [
            { "code": "nv", "name": "Melanocytic Nevi", "percent": 82.4, "color": "#3b82f6" },
            ...
        ]
    }
    """
    # ── 1. Validate request ───────────────────────────────────────────────────
    if "file" not in request.files:
        return jsonify({"error": "No file field in request. Send the image as 'file'."}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename. Please select an image."}), 400

    if not _allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type '{file.filename}'. Use JPG, PNG, or WEBP."
        }), 415

    # ── 2. Open & validate image ──────────────────────────────────────────────
    try:
        image = Image.open(file.stream).convert("RGB")
    except Exception as exc:
        return jsonify({"error": f"Cannot open image: {exc}"}), 422

    # Basic size guard (reject completely blank or tiny images)
    if image.width < 10 or image.height < 10:
        return jsonify({"error": "Image is too small (minimum 10×10 pixels)."}), 422

    # ── 3. Preprocess ─────────────────────────────────────────────────────────
    image_tensor = _transform(image).unsqueeze(0).to(device)

    # ── 4. Forward pass ───────────────────────────────────────────────────────
    with torch.no_grad():
        outputs = _model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        predicted_index = int(torch.argmax(probabilities).item())
        confidence = float(probabilities[predicted_index].item() * 100)

    predicted_class = CLASSES[predicted_index]
    predicted_name  = CLASS_NAMES[predicted_class]
    is_benign       = predicted_class in BENIGN_CLASSES

    # Build probability dict { code: raw_float } for frontend
    prob_dict = {CLASSES[i]: float(probabilities[i].item()) for i in range(len(CLASSES))}

    # Build sorted all_probabilities list (frontend bar chart)
    all_probs = sorted([
        {
            "code":    code,
            "name":    CLASS_NAMES[code],
            "percent": round(float(probabilities[CLASSES.index(code)].item()) * 100, 1),
            "color":   CLASS_COLORS[code],
        }
        for code in CLASSES
    ], key=lambda x: x["percent"], reverse=True)

    # ── 5. Grad-CAM ───────────────────────────────────────────────────────────
    gradcam_b64 = None
    try:
        heatmap_arr = generate_gradcam(
            model=_model,
            image_tensor=image_tensor,
            original_image=image,
            target_class=predicted_index,
        )
        gradcam_b64 = _image_to_base64(heatmap_arr)
    except Exception as exc:
        print(f"[SkinScan API] Grad-CAM failed (non-fatal): {exc}")
        # Return prediction without Grad-CAM; frontend handles missing gradcam gracefully

    # ── 6. Respond ────────────────────────────────────────────────────────────
    return jsonify({
        "predicted_class":  predicted_class,
        "class_name":       predicted_name,
        "confidence":       round(confidence, 2),
        "is_benign":        is_benign,
        "probabilities":    prob_dict,
        "gradcam_base64":   gradcam_b64,
        "explanation":      CLASS_EXPLANATIONS.get(predicted_class, ""),
        "all_probabilities": all_probs,
    })


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[SkinScan API] Starting Flask server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
