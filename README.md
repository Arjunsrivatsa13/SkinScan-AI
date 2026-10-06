# SkinScan AI 🔬

AI-powered skin lesion analysis with deep learning and visual explainability.

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

