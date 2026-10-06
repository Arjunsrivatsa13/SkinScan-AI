/**
 * HAM10000 Dataset Information & Statistics
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

export const DATASET_INFO = {
  name: "HAM10000",
  fullName: "Human Against Machine with 10000 training images",
  source: "Kaggle / Harvard Dataverse / ISIC Archive",
  totalImages: 10015,
  numClasses: 7,
  classes: [
    {
      code: "nv",
      name: "Melanocytic Nevus",
      scientificName: "Melanocytic nevi",
      type: "Benign",
      riskLevel: "Low",
      count: 6705,
      percentage: 66.95,
      color: "#3b82f6",
      description: "Benign melanocytic proliferations commonly known as moles. They are composed of melanocyte nests and can appear anywhere on the skin."
    },
    {
      code: "mel",
      name: "Melanoma",
      scientificName: "Malignant melanoma",
      type: "Malignant",
      riskLevel: "High",
      count: 1113,
      percentage: 11.11,
      color: "#ef4444",
      description: "The most dangerous form of skin cancer, developing from melanin-producing cells. Early detection and complete surgical excision are critical."
    },
    {
      code: "bkl",
      name: "Seborrheic Keratosis",
      scientificName: "Benign keratosis-like lesions",
      type: "Benign",
      riskLevel: "Low",
      count: 1099,
      percentage: 10.97,
      color: "#6366f1",
      description: "Common non-cancerous skin growth that often appears warty, waxy, or stuck-on. Includes solar lentigines and lichenoid keratoses."
    },
    {
      code: "bcc",
      name: "Basal Cell Carcinoma",
      scientificName: "Basal cell carcinoma",
      type: "Malignant",
      riskLevel: "Moderate",
      count: 514,
      percentage: 5.13,
      color: "#06b6d4",
      description: "The most common form of skin cancer. Locally invasive but rarely metastasizes. Frequently occurs on sun-exposed areas such as the face."
    },
    {
      code: "akiec",
      name: "Actinic Keratosis",
      scientificName: "Actinic keratoses & intraepithelial carcinoma",
      type: "Pre-cancerous",
      riskLevel: "Moderate",
      count: 327,
      percentage: 3.27,
      color: "#f43f5e",
      description: "Pre-cancerous crusty, scaly lesions caused by chronic UV damage. May progress to invasive squamous cell carcinoma if untreated."
    },
    {
      code: "vasc",
      name: "Vascular Lesion",
      scientificName: "Vascular lesions",
      type: "Benign",
      riskLevel: "Low",
      count: 142,
      percentage: 1.42,
      color: "#ec4899",
      description: "Benign blood vessel abnormalities including cherry angiomas, angiokeratomas, and pyogenic granulomas."
    },
    {
      code: "df",
      name: "Dermatofibroma",
      scientificName: "Dermatofibroma",
      type: "Benign",
      riskLevel: "Low",
      count: 115,
      percentage: 1.15,
      color: "#8b5cf6",
      description: "Benign cutaneous nodule, typically asymptomatic, often presenting with the characteristic 'dimple sign' upon lateral pinch."
    }
  ],
  demographics: {
    gender: { male: 5406, female: 4552, unknown: 57 },
    topLocalizations: [
      { site: "Back", count: 2192, percent: 21.9 },
      { site: "Lower Extremity", count: 2077, percent: 20.7 },
      { site: "Trunk", count: 1404, percent: 14.0 },
      { site: "Upper Extremity", count: 1118, percent: 11.2 },
      { site: "Abdomen", count: 1022, percent: 10.2 },
      { site: "Face", count: 745, percent: 7.4 },
      { site: "Chest", count: 407, percent: 4.1 }
    ],
    validationMethods: [
      { method: "Histopathology", count: 5340, percent: 53.3 },
      { method: "Follow-up Exam", count: 3704, percent: 37.0 },
      { method: "Expert Consensus", count: 902, percent: 9.0 },
      { method: "Confocal Microscopy", count: 69, percent: 0.7 }
    ]
  }
};
