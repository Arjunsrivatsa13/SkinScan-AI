/**
 * Dataset Info View Component
 * SkinScan AI - HAM10000 Dataset Analysis & Explorer
 */

import { Icons } from '../icons.js';
import { DATASET_INFO } from '../../data/datasetInfo.js';
import { SAMPLE_LESIONS } from '../../data/sampleLesions.js';
import { store } from '../../state.js';

export class DatasetView {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: var(--text-heading);">HAM10000 Dataset Overview</h1>
            <p style="color: var(--text-muted); font-size: 13px;">
              "Human Against Machine with 10000 training images" • Benchmark dataset for pigmented skin lesion diagnosis.
            </p>
          </div>
          <button class="hero-cta-btn" id="btn-dataset-analyze" style="padding: 10px 20px; font-size: 13.5px;">
            ${Icons.analyze}
            <span>Open Analysis Studio</span>
          </button>
        </div>

        <!-- 3 Quick Stat Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div class="card" style="padding: 18px;">
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">TOTAL DERMOSCOPIC IMAGES</div>
            <div style="font-size: 28px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">10,015</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Standardized high-resolution captures</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">DIAGNOSTIC CLASSES</div>
            <div style="font-size: 28px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">7 Classes</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Benign, pre-cancerous, and malignant</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">GROUND TRUTH VERIFICATION</div>
            <div style="font-size: 28px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">53.3%</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Confirmed via formal histopathology</div>
          </div>
        </div>

        <!-- Class Breakdown Table -->
        <div class="card" style="padding: 24px;">
          <div class="card-header" style="margin-bottom: 16px;">
            <div class="card-title-group">
              <span class="card-title-icon">${Icons.layers}</span>
              <h2>HAM10000 Diagnostic Distribution & Risk Categories</h2>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${DATASET_INFO.classes.map(c => `
              <div style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; background: var(--bg-card-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="color-dot" style="background-color: ${c.color}; width: 10px; height: 10px;"></span>
                    <strong style="font-size: 14px; color: var(--text-heading);">${c.name}</strong>
                    <span style="font-size: 12px; color: var(--text-muted); font-family: monospace;">(${c.code})</span>
                    <span class="status-pill ${c.type === 'Benign' ? 'benign' : 'malignant'}" style="font-size: 11px; padding: 2px 8px;">
                      ${c.type} • Risk: ${c.riskLevel}
                    </span>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-heading);">
                    ${c.count.toLocaleString()} cases (${c.percentage}%)
                  </div>
                </div>

                <div class="progress-track" style="height: 8px; margin-bottom: 8px;">
                  <div class="progress-fill" style="width: ${c.percentage}%; background: ${c.color};"></div>
                </div>

                <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">
                  ${c.description}
                </p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Demographics & Validation Methods Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Anatomical Sites -->
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Anatomical Distribution</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${DATASET_INFO.demographics.topLocalizations.map(loc => `
                <div style="display: grid; grid-template-columns: 140px 1fr 50px; align-items: center; gap: 12px; font-size: 12px;">
                  <span style="color: var(--text-heading); font-weight: 500;">${loc.site}</span>
                  <div class="progress-track" style="height: 6px;">
                    <div class="progress-fill" style="width: ${loc.percent * 3.5}%; background: var(--primary-600);"></div>
                  </div>
                  <span style="text-align: right; color: var(--text-muted); font-weight: 600;">${loc.percent}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Ground Truth Validation -->
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Diagnostic Verification Method</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${DATASET_INFO.demographics.validationMethods.map(m => `
                <div style="display: grid; grid-template-columns: 160px 1fr 50px; align-items: center; gap: 12px; font-size: 12px;">
                  <span style="color: var(--text-heading); font-weight: 500;">${m.method}</span>
                  <div class="progress-track" style="height: 6px;">
                    <div class="progress-fill" style="width: ${m.percent}%; background: #6366f1;"></div>
                  </div>
                  <span style="text-align: right; color: var(--text-muted); font-weight: 600;">${m.percent}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Sample Case Gallery -->
        <div class="card" style="padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Benchmark HAM10000 Cases Gallery</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            ${SAMPLE_LESIONS.map(s => `
              <div style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-card-subtle); display: flex; flex-direction: column;">
                <img src="${s.originalImage}" alt="${s.name}" style="width: 100%; aspect-ratio: 1; object-fit: cover;" />
                <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px; flex-grow: 1;">
                  <span class="status-pill ${s.type === 'Benign' ? 'benign' : 'malignant'}" style="font-size: 10px; padding: 1px 6px;">
                    ${s.type}
                  </span>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-heading);">${s.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${s.patientInfo}</div>
                  <button class="sample-pill-btn" data-gallery-load="${s.id}" style="margin-top: 8px; justify-content: center; width: 100%;">
                    <span>Load Case</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    this.container.querySelector('#btn-dataset-analyze')?.addEventListener('click', () => {
      store.setView('analyze');
    });

    this.container.querySelectorAll('[data-gallery-load]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-gallery-load');
        const sample = SAMPLE_LESIONS.find(s => s.id === id);
        if (sample) {
          store.setAnalysis(sample);
          store.setView('analyze');
          store.showToast(`Loaded benchmark sample ${sample.name} into Studio`, 'success');
        }
      });
    });
  }
}
