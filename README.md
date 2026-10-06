# SkinScan AI 🔬

AI-powered skin lesion analysis with deep learning and visual explainability.

<img width="1470" height="833" alt="Screenshot 2026-10-07 at 12 44 46 AM" src="https://github.com/user-attachments/assets/f77eea1c-5e47-4b9d-b5b6-b17dea304916" />


SkinScan AI is an end-to-end skin lesion analysis platform built using **ResNet50 transfer learning** and **Grad-CAM explainability**. It classifies dermoscopic images into seven skin-lesion categories and provides visual insight into the regions that influenced the model's prediction.

> ⚠️ **Disclaimer:** SkinScan AI is an educational and research project. It is not a medical diagnostic tool and should not be used to make medical decisions.

---

## ✨ Features

- 🧠 **Deep Learning Classification** using ResNet50
- 🔬 **7-Class Skin Lesion Classification**
- 🗺️ **Grad-CAM Explainability** to visualize model attention
- 📊 **Model Performance Dashboard**
- 🖼️ **Sample Lesion Gallery**
- 📈 **Dataset and model statistics**
- 🌐 **Modern web-based interface**
- ⚡ **Flask-based prediction API**
- 🧪 **Dataset and model evaluation utilities**
- 📤 **Analysis result export functionality**

---

## 🧠 Model

SkinScan AI uses **ResNet50**, a convolutional neural network pretrained on ImageNet and adapted using **transfer learning** for skin-lesion classification.

### Model Pipeline

```text
Dermoscopic Image
       ↓
Image Preprocessing
       ↓
ResNet50
       ↓
7-Class Classification
       ↓
Prediction + Confidence
       ↓
Grad-CAM
       ↓
Visual Explanation
```
## 🩺 Supported Classes

The model predicts seven categories from the HAM10000 dataset:

| Class | Description |
|---|---|
| **AKIEC** | Actinic keratoses / intraepithelial carcinoma |
| **BCC** | Basal cell carcinoma |
| **BKL** | Benign keratosis-like lesions |
| **DF** | Dermatofibroma |
| **MEL** | Melanoma |
| **NV** | Melanocytic nevi |
| **VASC** | Vascular lesions |

---

## 📊 Dataset

SkinScan AI uses the HAM10000 (Human Against Machine with 10000 training images) dataset.

The dataset contains 10,015 dermoscopic images across seven diagnostic categories.

### Dataset Distribution

| Class | Images |
|---|---:|
| **NV** | 6,705 |
| **MEL** | 1,113 |
| **BKL** | 1,099 |
| **BCC** | 514 |
| **AKIEC** | 327 |
| **VASC** | 142 |
| **DF** | 115 |
| **Total** | **10,015** |

The dataset is used for model training and evaluation.

> **Note:** The dataset is not included in this repository because of its size.

---

## 📈 Model Performance

Current evaluation results:

| Metric | Score |
|---|---:|
| **Accuracy** | **82%** |
| **Weighted F1 Score** | **0.83** |

### Class-wise Recall

| Class | Recall |
|---|---:|
| **AKIEC** | **0.88** |
| **BCC** | **0.85** |
| **BKL** | **0.64** |
| **DF** | **0.91** |
| **MEL** | **0.53** |
| **NV** | **0.89** |
| **VASC** | **0.93** |

> **Note:** Performance can vary depending on preprocessing, dataset split, training configuration, and evaluation conditions.

---

## 🔥 Grad-CAM Explainability

A key component of SkinScan AI is Grad-CAM (Gradient-weighted Class Activation Mapping).

Instead of providing only a prediction, the system can generate a heatmap showing image regions that contributed to the model's prediction.

### Explainability Pipeline

```text
Input Image
     ↓
ResNet50 Prediction
     ↓
Gradient Analysis
     ↓
Grad-CAM Heatmap
     ↓
Overlay Visualization
```

##🏗️ System Architecture
```text
┌──────────────────────────────────────┐
│              FRONTEND                │
│                                      │
│  Dashboard → Analysis → Results     │
│  Dataset → Performance → About      │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│              FLASK API               │
│                                      │
│  Image Upload → Preprocessing       │
│  Prediction → Confidence → Grad-CAM │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│            RESNET50 MODEL            │
│                                      │
│        Transfer Learning             │
│              ↓                       │
│       7-Class Prediction             │
└──────────────────────────────────────┘
```
##📁 Project Structure

**GitHub Repository**

```text
SkinScan-AI/
│
├── backend/
│   ├── dataset.py
│   ├── evaluate.py
│   ├── flask_api.py
│   ├── gradcam.py
│   ├── model.py
│   ├── prepare_dataset.py
│   ├── test_dataset.py
│   ├── test_model.py
│   ├── train.py
│   └── view_dataset.py
│
├── frontend/
│   ├── assets/
│   ├── index.html
│   ├── package.json
│   ├── server.js
│   └── test_interactions.js
│
├── notebooks/
├── .gitignore
├── start.sh
└── README.md
```
## ⚙️ Tech Stack

### Machine Learning

- Python
- PyTorch
- Torchvision
- ResNet50
- Transfer Learning
- Grad-CAM
- HAM10000

### Backend

- Flask
- Python

### Frontend

- HTML
- CSS
- JavaScript
- Node.js

### Development

- Git
- GitHub
- macOS / Apple Silicon

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Arjunsrivatsa13/SkinScan-AI.git
cd SkinScan-AI
```
### 2. Create a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```
### 3. Install Dependencies
Install the required Python and frontend dependencies according to the project configuration.
The repository intentionally does not include the local virtual environment.

### 4. Add the Dataset
Download the HAM10000 dataset and place the required dataset files inside:
```bash
dataset/
```

### 5. Add Model Weights
Place the trained model weights inside:
```bash
models/
```

### 6. Start the Application
The project includes:
```bash
./start.sh
```
Alternatively, the Flask backend and frontend can be started independently using their respective scripts.
##🧪 Model Development
The backend contains scripts covering the major stages of the machine-learning workflow.

Dataset Preparation
```bash
python backend/prepare_dataset.py
```
Model Training
```bash
python backend/train.py
```

Model Evaluation
```bash
python backend/evaluate.py
```

Grad-CAM Generation
```bash
python backend/gradcam.py
```

Dataset Inspection
```bash
python backend/view_dataset.py
```

Dataset Testing
```bash
python backend/test_dataset.py
```

Model Testing
```bash
python backend/test_model.py
```

## 🔍 Explainability

SkinScan AI follows the principle that a prediction should be accompanied by an explanation.

Grad-CAM provides a visual representation of the areas that contributed most strongly to the neural network's prediction.

This can help users inspect model behavior rather than relying solely on a classification label.

## 🎯 Project Goals

SkinScan AI was built to explore:

- Computer vision for medical imaging
- Transfer learning with pretrained CNNs
- Explainable AI
- End-to-end ML application development
- Model evaluation across imbalanced classes
- Deep-learning inference through a web application
- Connecting ML models with production-style interfaces

## 🔮 Future Improvements

Potential future development includes:

- Improved performance on minority classes
- Advanced data augmentation
- Model calibration and uncertainty estimation
- Additional explainability techniques
- More robust validation strategies
- Model versioning
- Cloud deployment
- Secure inference API
- User authentication and analysis history
- More comprehensive clinical validation

## ⚠️ Medical Disclaimer

SkinScan AI is intended solely for educational and research purposes.

It does not provide medical advice, diagnosis, or treatment recommendations. Predictions produced by the system may be incorrect and should not be relied upon for clinical decisions.

If you have concerns about a skin lesion or changes to your skin, consult a qualified healthcare professional.

## 📄 License

This project is intended for educational and research purposes. Please review the licensing terms of the HAM10000 dataset and any third-party components before redistribution.
