/**
 * Sample Benchmark Lesions from HAM10000
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

export const SAMPLE_LESIONS = [
  {
    id: "sample-nv-default",
    code: "nv",
    name: "Melanocytic Nevus",
    type: "Benign",
    confidence: 82.4,
    originalImage: "assets/samples/nv_orig.jpg",
    gradcamImage: "assets/samples/nv_gradcam.jpg",
    topProbabilities: [
      { name: "Melanocytic Nevus", percent: 82.4, color: "#3b82f6" },
      { name: "Basal Cell Carcinoma", percent: 6.8, color: "#06b6d4" },
      { name: "Seborrheic Keratosis", percent: 4.7, color: "#6366f1" },
      { name: "Dermatofibroma", percent: 3.1, color: "#8b5cf6" },
      { name: "Melanoma", percent: 2.0, color: "#d946ef" }
    ],
    allProbabilities: [
      { code: "nv", name: "Melanocytic Nevus", percent: 82.4, color: "#3b82f6" },
      { code: "bcc", name: "Basal Cell Carcinoma", percent: 6.8, color: "#06b6d4" },
      { code: "bkl", name: "Seborrheic Keratosis", percent: 4.7, color: "#6366f1" },
      { code: "df", name: "Dermatofibroma", percent: 3.1, color: "#8b5cf6" },
      { code: "mel", name: "Melanoma", percent: 2.0, color: "#d946ef" },
      { code: "vasc", name: "Vascular Lesion", percent: 0.7, color: "#ec4899" },
      { code: "akiec", name: "Actinic Keratosis", percent: 0.3, color: "#f43f5e" }
    ],
    timestamp: "Just now",
    lesionId: "HAM_0001751",
    patientInfo: "70yo Male • Face",
    explanation: "The Grad-CAM heatmap highlights a symmetric, uniform central pigment pattern with well-circumscribed borders characteristic of a benign melanocytic nevus."
  },
  {
    id: "sample-mel",
    code: "mel",
    name: "Melanoma",
    type: "Malignant",
    confidence: 89.2,
    originalImage: "assets/samples/mel_orig.jpg",
    gradcamImage: "assets/samples/mel_gradcam.jpg",
    topProbabilities: [
      { name: "Melanoma", percent: 89.2, color: "#ef4444" },
      { name: "Melanocytic Nevus", percent: 5.4, color: "#3b82f6" },
      { name: "Seborrheic Keratosis", percent: 2.8, color: "#6366f1" },
      { name: "Basal Cell Carcinoma", percent: 1.6, color: "#06b6d4" },
      { name: "Actinic Keratosis", percent: 1.0, color: "#f43f5e" }
    ],
    allProbabilities: [
      { code: "mel", name: "Melanoma", percent: 89.2, color: "#ef4444" },
      { code: "nv", name: "Melanocytic Nevus", percent: 5.4, color: "#3b82f6" },
      { code: "bkl", name: "Seborrheic Keratosis", percent: 2.8, color: "#6366f1" },
      { code: "bcc", name: "Basal Cell Carcinoma", percent: 1.6, color: "#06b6d4" },
      { code: "akiec", name: "Actinic Keratosis", percent: 1.0, color: "#f43f5e" },
      { code: "df", name: "Dermatofibroma", percent: 0.0, color: "#8b5cf6" },
      { code: "vasc", name: "Vascular Lesion", percent: 0.0, color: "#ec4899" }
    ],
    timestamp: "Yesterday",
    lesionId: "HAM_0004234",
    patientInfo: "85yo Female • Chest",
    explanation: "Grad-CAM focal activation indicates atypical pigment network, irregular peripheral pseudopods, and asymmetric borders strongly indicative of malignant melanoma."
  },
  {
    id: "sample-bcc",
    code: "bcc",
    name: "Basal Cell Carcinoma",
    type: "Malignant",
    confidence: 78.5,
    originalImage: "assets/samples/bcc_orig.jpg",
    gradcamImage: "assets/samples/bcc_gradcam.jpg",
    topProbabilities: [
      { name: "Basal Cell Carcinoma", percent: 78.5, color: "#06b6d4" },
      { name: "Actinic Keratosis", percent: 10.2, color: "#f43f5e" },
      { name: "Melanocytic Nevus", percent: 6.1, color: "#3b82f6" },
      { name: "Seborrheic Keratosis", percent: 3.5, color: "#6366f1" },
      { name: "Melanoma", percent: 1.7, color: "#ef4444" }
    ],
    allProbabilities: [
      { code: "bcc", name: "Basal Cell Carcinoma", percent: 78.5, color: "#06b6d4" },
      { code: "akiec", name: "Actinic Keratosis", percent: 10.2, color: "#f43f5e" },
      { code: "nv", name: "Melanocytic Nevus", percent: 6.1, color: "#3b82f6" },
      { code: "bkl", name: "Seborrheic Keratosis", percent: 3.5, color: "#6366f1" },
      { code: "mel", name: "Melanoma", percent: 1.7, color: "#ef4444" },
      { code: "df", name: "Dermatofibroma", percent: 0.0, color: "#8b5cf6" },
      { code: "vasc", name: "Vascular Lesion", percent: 0.0, color: "#ec4899" }
    ],
    timestamp: "3 days ago",
    lesionId: "HAM_0002761",
    patientInfo: "60yo Male • Face",
    explanation: "Arborizing telangiectasia and translucent shiny papule edges contributed most heavily to the model's basal cell carcinoma classification."
  },
  {
    id: "sample-bkl",
    code: "bkl",
    name: "Seborrheic Keratosis",
    type: "Benign",
    confidence: 84.1,
    originalImage: "assets/samples/bkl_orig.jpg",
    gradcamImage: "assets/samples/bkl_gradcam.jpg",
    topProbabilities: [
      { name: "Seborrheic Keratosis", percent: 84.1, color: "#6366f1" },
      { name: "Melanocytic Nevus", percent: 9.3, color: "#3b82f6" },
      { name: "Melanoma", percent: 3.2, color: "#ef4444" },
      { name: "Basal Cell Carcinoma", percent: 2.1, color: "#06b6d4" },
      { name: "Actinic Keratosis", percent: 1.3, color: "#f43f5e" }
    ],
    allProbabilities: [
      { code: "bkl", name: "Seborrheic Keratosis", percent: 84.1, color: "#6366f1" },
      { code: "nv", name: "Melanocytic Nevus", percent: 9.3, color: "#3b82f6" },
      { code: "mel", name: "Melanoma", percent: 3.2, color: "#ef4444" },
      { code: "bcc", name: "Basal Cell Carcinoma", percent: 2.1, color: "#06b6d4" },
      { code: "akiec", name: "Actinic Keratosis", percent: 1.3, color: "#f43f5e" },
      { code: "df", name: "Dermatofibroma", percent: 0.0, color: "#8b5cf6" },
      { code: "vasc", name: "Vascular Lesion", percent: 0.0, color: "#ec4899" }
    ],
    timestamp: "5 days ago",
    lesionId: "HAM_0000118",
    patientInfo: "80yo Male • Scalp",
    explanation: "Keratin-filled cysts (milia-like cysts) and cerebriform ridges give clear feature signals for benign seborrheic keratosis."
  }
];
