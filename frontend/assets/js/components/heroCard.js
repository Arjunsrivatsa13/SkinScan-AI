/**
 * Hero Card Component
 * SkinScan AI - Primary Dashboard Action & Active Lesion Overview
 */

import { Icons } from './icons.js';
import { store } from '../state.js';

export class HeroCardComponent {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    store.subscribe('analysisChange', () => {
      this.render();
      this.attachEvents();
    });
  }

  render() {
    const analysis = store.getState().activeAnalysis;
    const isBenign = analysis.type === 'Benign';

    this.container.innerHTML = `
      <div class="card hero-card">
        <!-- Left Column: Copy & Actions -->
        <div class="hero-left">
          <div class="hero-greeting">Welcome back, Arjun</div>
          <h1 class="hero-title">SkinScan AI</h1>
          <h2 class="hero-subtitle">AI-Powered Skin Lesion Analysis</h2>
          <p class="hero-description">
            Upload a skin image and get an AI-assisted classification with confidence score, class probabilities and visual explanation (Grad-CAM) to better understand the result.
          </p>

          <button class="hero-cta-btn" id="hero-upload-btn" aria-label="Upload and analyze skin lesion image">
            ${Icons.upload}
            <span>Upload & Analyze Image</span>
            ${Icons.arrowRight}
          </button>

          <div class="hero-badges">
            <div class="feature-badge" title="ResNet50 architecture fine-tuned on HAM10000">
              ${Icons.chip}
              <span>ResNet50 Model</span>
            </div>
            <div class="feature-badge" title="Gradient-weighted Class Activation Mapping for visual explainability">
              ${Icons.eye}
              <span>Grad-CAM Visualization</span>
            </div>
            <div class="feature-badge" title="AI assistance tool for dermatologists and clinical research">
              ${Icons.shield}
              <span>AI Assisted</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Dual Image Comparison & Probability Summary -->
        <div class="hero-right">
          <div class="hero-images-duo">
            <div class="hero-image-box" id="hero-orig-box" title="Click to view full original image">
              <span class="image-tag-pill">Original Image</span>
              <img src="${analysis.originalImage}" alt="Original Skin Lesion" loading="eager" />
            </div>
            <div class="hero-image-box" id="hero-gradcam-box" title="Click to view full Grad-CAM visualization">
              <span class="image-tag-pill">Grad-CAM</span>
              <img src="${analysis.gradcamImage}" alt="Grad-CAM Heatmap" loading="eager" />
            </div>
          </div>

          <div class="hero-prediction-summary">
            <span class="status-pill ${isBenign ? 'benign' : 'malignant'}">
              ${Icons.check}
              <span>${analysis.type}</span>
            </span>

            <h3 class="prediction-title">${analysis.name}</h3>

            <div class="confidence-row">
              <div class="confidence-header">
                <span class="confidence-label">Confidence</span>
                <span class="confidence-val">${analysis.confidence}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${analysis.confidence}%;"></div>
              </div>
            </div>

            <div class="top-probabilities-list">
              <div class="top-prob-title">Top Probabilities</div>
              ${(analysis.topProbabilities || []).slice(0, 5).map(item => `
                <div class="top-prob-item">
                  <span class="top-prob-name">${item.name}</span>
                  <span class="top-prob-percent">${item.percent}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Open upload modal
    const uploadBtn = this.container.querySelector('#hero-upload-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        store.openModal('upload');
      });
    }

    // Lightbox image preview
    const origBox = this.container.querySelector('#hero-orig-box');
    const gradcamBox = this.container.querySelector('#hero-gradcam-box');
    const analysis = store.getState().activeAnalysis;

    if (origBox) {
      origBox.addEventListener('click', () => {
        store.openLightbox(analysis.originalImage, `Original Image - ${analysis.name}`);
      });
    }

    if (gradcamBox) {
      gradcamBox.addEventListener('click', () => {
        store.openLightbox(analysis.gradcamImage, `Grad-CAM Visualization - ${analysis.name}`);
      });
    }

    // Badges tooltip info click
    this.container.querySelectorAll('.feature-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        store.setView('about');
      });
      badge.style.cursor = 'pointer';
    });
  }
}
