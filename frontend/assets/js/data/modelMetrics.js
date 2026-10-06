/**
 * ResNet-50 Model Performance Metrics & Training Progression
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

export const MODEL_SPECS = {
  architecture: "ResNet50 (Fine-tuned)",
  inputSize: "224 × 224",
  lossFunction: "Categorical Crossentropy",
  optimizer: "Adam",
  learningRate: "0.0001",
  framework: "PyTorch",
  weights: "skin_lesion_resnet50_best.pth",
  backbone: "ImageNet Pretrained ResNet50",
  device: "Apple MPS / CUDA / CPU",
  batchSize: 32,
  totalEpochs: 50
};

export const OVERALL_METRICS = {
  accuracy: 82.4,
  precision: 78.9,
  recall: 76.8,
  f1Score: 73.2,
  aucRoc: 93.6
};

// 50-epoch curve points matching the Training Progress line chart in screenshot
// Train curve starts at ~0.20 and rises smoothly to ~0.89
// Val curve starts at ~0.22 and rises to ~0.824
export const TRAINING_PROGRESS = [
  { epoch: 0, train: 0.20, val: 0.22, trainLoss: 1.85, valLoss: 1.80 },
  { epoch: 2, train: 0.32, val: 0.30, trainLoss: 1.58, valLoss: 1.62 },
  { epoch: 5, train: 0.44, val: 0.39, trainLoss: 1.34, valLoss: 1.45 },
  { epoch: 8, train: 0.53, val: 0.48, trainLoss: 1.15, valLoss: 1.28 },
  { epoch: 10, train: 0.58, val: 0.52, trainLoss: 1.02, valLoss: 1.18 },
  { epoch: 12, train: 0.63, val: 0.56, trainLoss: 0.92, valLoss: 1.09 },
  { epoch: 15, train: 0.67, val: 0.61, trainLoss: 0.83, valLoss: 0.99 },
  { epoch: 18, train: 0.71, val: 0.65, trainLoss: 0.74, valLoss: 0.92 },
  { epoch: 20, train: 0.73, val: 0.68, trainLoss: 0.68, valLoss: 0.87 },
  { epoch: 23, train: 0.76, val: 0.70, trainLoss: 0.62, valLoss: 0.82 },
  { epoch: 25, train: 0.78, val: 0.72, trainLoss: 0.57, valLoss: 0.78 },
  { epoch: 28, train: 0.80, val: 0.73, trainLoss: 0.52, valLoss: 0.76 },
  { epoch: 30, train: 0.81, val: 0.75, trainLoss: 0.48, valLoss: 0.73 },
  { epoch: 33, train: 0.82, val: 0.76, trainLoss: 0.45, valLoss: 0.71 },
  { epoch: 35, train: 0.83, val: 0.77, trainLoss: 0.42, valLoss: 0.69 },
  { epoch: 38, train: 0.84, val: 0.78, trainLoss: 0.39, valLoss: 0.68 },
  { epoch: 40, train: 0.85, val: 0.79, trainLoss: 0.36, valLoss: 0.66 },
  { epoch: 42, train: 0.86, val: 0.80, trainLoss: 0.34, valLoss: 0.65 },
  { epoch: 45, train: 0.87, val: 0.81, trainLoss: 0.31, valLoss: 0.64 },
  { epoch: 48, train: 0.88, val: 0.82, trainLoss: 0.28, valLoss: 0.63 },
  { epoch: 50, train: 0.89, val: 0.824, trainLoss: 0.26, valLoss: 0.62 }
];

export const CLASS_METRICS = [
  { code: "nv", name: "Melanocytic Nevus", precision: 88.5, recall: 91.2, f1: 89.8, support: 671 },
  { code: "mel", name: "Melanoma", precision: 74.2, recall: 71.8, f1: 73.0, support: 111 },
  { code: "bkl", name: "Seborrheic Keratosis", precision: 76.4, recall: 74.1, f1: 75.2, support: 110 },
  { code: "bcc", name: "Basal Cell Carcinoma", precision: 79.1, recall: 77.5, f1: 78.3, support: 51 },
  { code: "akiec", name: "Actinic Keratosis", precision: 68.3, recall: 65.2, f1: 66.7, support: 33 },
  { code: "vasc", name: "Vascular Lesion", precision: 84.6, recall: 81.3, f1: 82.9, support: 14 },
  { code: "df", name: "Dermatofibroma", precision: 81.0, recall: 76.9, f1: 78.9, support: 11 }
];

// Normalized Confusion Matrix values (in %)
export const CONFUSION_MATRIX = {
  labels: ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"],
  matrix: [
    [65.2,  6.1,  9.1,  0.0,  6.1, 12.1,  1.4],
    [ 3.9, 77.5,  3.9,  0.0,  5.9,  7.8,  1.0],
    [ 2.7,  3.6, 74.1,  1.8,  4.5, 12.5,  0.8],
    [ 0.0,  0.0,  9.1, 76.9,  0.0, 14.0,  0.0],
    [ 1.8,  4.5,  5.4,  0.0, 71.8, 16.2,  0.3],
    [ 1.0,  1.5,  4.3,  0.6,  1.4, 91.2,  0.0],
    [ 0.0,  0.0,  7.1,  0.0,  0.0, 11.6, 81.3]
  ]
};
