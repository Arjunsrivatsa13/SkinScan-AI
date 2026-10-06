/**
 * Recent Analysis Component
 * SkinScan AI - Detailed 7-Class Breakdown & Grad-CAM Visualizer
 */

import { Icons } from './icons.js';
import { store } from '../state.js';

export class RecentAnalysisComponent {
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
    store.subscribe('recentChange', () => {
      this.render();
      this.attachEvents();
    });
  }

  render() {
    const state = store.getState();
    const analysis = state.activeAnalysis;
    const isBenign = analysis.type === 'Benign';
    const recentList = state.recentAnalyses;

    this.container.innerHTML = `
      <div class="card recent-analysis-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-title-icon">${Icons.clock}</span>
            <h2>Recent Analysis</h2>
          </div>
          ${recentList.length > 1 ? `
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 11.5px; color: var(--text-muted);">History (${recentList.length}):</span>
              <div style="display: flex; gap: 4px;" id="recent-switcher-chips">
                ${recentList.slice(0, 4).map((rec, i) => `
                  <button class="sample-pill-btn ${rec.id === analysis.id ? 'active' : ''}" data-index="${i}" style="padding: 2px 8px; font-size: 11px;">
                    ${rec.name.split(' ')[0]}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="recent-analysis-body">
          <!-- Column 1: Uploaded Image Preview -->
          <div class="recent-image-col">
            <div class="recent-image-preview" id="recent-orig-img" title="Click to open enlarged view">
              <span class="image-tag-pill">Uploaded Image</span>
              <img src="${analysis.originalImage}" alt="Uploaded Skin Lesion" />
            </div>
          </div>

          <!-- Column 2: Diagnosis & Full 7-Class Probabilities -->
          <div class="recent-details-col">
            <span class="status-pill ${isBenign ? 'benign' : 'malignant'}">
              ${Icons.check}
              <span>${analysis.type}</span>
            </span>

            <h3 class="prediction-title" style="font-size: 18px;">${analysis.name}</h3>

            <div class="confidence-row">
              <div class="confidence-header">
                <span class="confidence-label">Confidence</span>
                <span class="confidence-val" style="font-size: 16px;">${analysis.confidence}%</span>
              </div>
              <div class="progress-track" style="height: 5px;">
                <div class="progress-fill" style="width: ${analysis.confidence}%;"></div>
              </div>
            </div>

            <div class="class-probabilities-group">
              <div style="font-size: 11.5px; font-weight: 600; color: var(--text-heading); margin-bottom: 2px;">
                Class Probabilities
              </div>

              ${(analysis.allProbabilities || []).map(item => `
                <div class="class-prob-row">
                  <div class="class-label-with-dot" title="${item.name}">
                    <span class="color-dot" style="background-color: ${item.color || '#3b82f6'};"></span>
                    <span>${item.name}</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${item.percent}%; background: ${item.color || '#3b82f6'};"></div>
                  </div>
                  <div class="class-prob-val">${item.percent}%</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column 3: Grad-CAM Visualization Box -->
          <div class="recent-gradcam-col">
            <div class="gradcam-title">Grad-CAM Visualization</div>
            <div class="gradcam-box" id="recent-gradcam-img" title="Click to enlarge Grad-CAM heatmap">
              <img src="${analysis.gradcamImage}" alt="Grad-CAM Visualization" />
            </div>
            <p class="gradcam-caption">
              The heatmap highlights the regions that influenced the model's prediction.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const analysis = store.getState().activeAnalysis;

    // Lightbox triggers
    this.container.querySelector('#recent-orig-img')?.addEventListener('click', () => {
      store.openLightbox(analysis.originalImage, `Uploaded Image - ${analysis.name}`);
    });

    this.container.querySelector('#recent-gradcam-img')?.addEventListener('click', () => {
      store.openLightbox(analysis.gradcamImage, `Grad-CAM Visualization - ${analysis.name}`);
    });

    // History switcher buttons
    this.container.querySelectorAll('#recent-switcher-chips button').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const item = store.getState().recentAnalyses[idx];
        if (item) {
          store.setAnalysis(item);
        }
      });
    });
  }
}
