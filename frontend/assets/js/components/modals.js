/**
 * Modals Component (Upload, Settings, Class Distribution, Lightbox)
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

import { Icons } from './icons.js';
import { store } from '../state.js';
import { predictionService } from '../services/predictionService.js';
import { DATASET_INFO } from '../data/datasetInfo.js';
import { SAMPLE_LESIONS } from '../data/sampleLesions.js';

export class ModalsComponent {
  constructor(container) {
    this.container = container;
    this.uploadedFile = null;
    this.uploadedPreviewUrl = null;
    this.isCameraActive = false;
    this.init();
  }

  init() {
    this.render();
    this.attachGlobalEvents();
    store.subscribe('modalChange', ({ activeModal, data }) => {
      this.handleModalChange(activeModal, data);
    });
  }

  render() {
    this.container.innerHTML = `
      <!-- Upload & Analyze Modal -->
      <div class="modal-overlay" id="modal-upload">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
          <div class="modal-header">
            <h3 id="upload-modal-title">Upload & Analyze Skin Lesion</h3>
            <button class="modal-close-btn" data-close="true" aria-label="Close modal">${Icons.close}</button>
          </div>

          <div class="modal-body">
            <!-- Normal Upload State -->
            <div id="upload-state-normal">
              <input type="file" id="modal-file-input" accept="image/jpeg,image/png,image/webp" style="display: none;" />

              <!-- Drag and drop zone -->
              <div class="dropzone" id="modal-dropzone">
                <div class="dropzone-icon">${Icons.upload}</div>
                <h4>Drag & drop lesion image here</h4>
                <p>Supports JPG, JPEG, PNG, or WEBP (Max 15MB)</p>
                <button type="button" class="sample-pill-btn" id="modal-browse-btn" style="background: white; border-color: var(--primary-500); color: var(--primary-600); font-weight: 600;">
                  Browse from Computer
                </button>
              </div>

              <!-- Quick Presets -->
              <div class="sample-picker-group" style="margin-top: 18px;">
                <div class="sample-picker-title">Or test with verified HAM10000 benchmark samples:</div>
                <div class="sample-pills-row">
                  ${SAMPLE_LESIONS.map(s => `
                    <button type="button" class="sample-pill-btn" data-sample-id="${s.id}">
                      <img src="${s.originalImage}" class="sample-pill-thumb" alt="${s.name}" />
                      <span>${s.name} (${s.confidence}%)</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Image Preview Box (Hidden until selected) -->
              <div id="upload-preview-container" style="display: none; margin-top: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px; background: var(--bg-card-subtle);">
                <div style="display: flex; gap: 16px; align-items: center;">
                  <img id="upload-preview-img" src="" alt="Preview" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" />
                  <div style="flex-grow: 1;">
                    <div id="upload-file-name" style="font-weight: 600; font-size: 13px; color: var(--text-heading);">image.jpg</div>
                    <div id="upload-file-size" style="font-size: 11px; color: var(--text-muted);">Ready for ResNet-50 inference</div>
                  </div>
                  <button type="button" class="sample-pill-btn" id="upload-remove-btn" style="color: var(--status-malignant-text);">
                    ${Icons.close}
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading State during inference -->
            <div id="upload-state-loading" style="display: none;">
              <div class="analysis-progress-box">
                <div class="scan-pulse-ring">
                  ${Icons.chip}
                </div>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--text-heading);" id="loading-step-title">
                  Analyzing skin lesion...
                </h4>
                <p style="font-size: 12.5px; color: var(--text-muted); max-width: 360px;" id="loading-step-desc">
                  Extracting feature maps with ResNet50 and computing Grad-CAM activations.
                </p>
                <div class="progress-track" style="width: 80%; height: 8px; margin-top: 8px;">
                  <div class="progress-fill" id="loading-bar-fill" style="width: 20%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" id="upload-modal-footer">
            <button type="button" class="sample-pill-btn" data-close="true">Cancel</button>
            <button type="button" class="hero-cta-btn" id="btn-run-analysis" style="padding: 10px 20px; font-size: 13.5px;" disabled>
              ${Icons.analyze}
              <span>Run AI Analysis</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Settings & API Modal -->
      <div class="modal-overlay" id="modal-settings">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
          <div class="modal-header">
            <h3 id="settings-modal-title">Settings & Neural Configuration</h3>
            <button class="modal-close-btn" data-close="true">${Icons.close}</button>
          </div>
          <div class="modal-body">
            <div>
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text-heading);">
                Inference Engine Mode
              </label>
              <select id="settings-mode-select" style="width: 100%; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-heading);">
                <option value="simulation">Neural Simulation (Client-side Canvas Grad-CAM - Instant & Offline)</option>
                <option value="live">Live PyTorch REST API (Connects to backend /predict endpoint)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text-heading);">
                Backend API Endpoint URL
              </label>
              <input type="text" id="settings-endpoint-input" value="http://localhost:8000/predict" placeholder="http://localhost:8000/predict" style="width: 100%; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-heading);" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                Enter the URL of your local FastAPI or Flask skin-lesion prediction service.
              </p>
            </div>

            <div>
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text-heading);">
                Confidence Classification Threshold: <span id="threshold-val-label">50%</span>
              </label>
              <input type="range" id="settings-threshold-slider" min="30" max="95" value="50" style="width: 100%;" />
            </div>

            <div>
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text-heading);">
                Visual Theme
              </label>
              <div style="display: flex; gap: 10px;">
                <button type="button" class="sample-pill-btn" id="theme-btn-light">☀️ Light Theme</button>
                <button type="button" class="sample-pill-btn" id="theme-btn-dark">🌙 Dark Theme</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="sample-pill-btn" id="btn-reset-settings">Reset Defaults</button>
            <button type="button" class="hero-cta-btn" id="btn-save-settings" style="padding: 8px 18px; font-size: 13px;">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Class Distribution Modal -->
      <div class="modal-overlay" id="modal-classDistribution">
        <div class="modal-container" style="max-width: 720px;" role="dialog" aria-modal="true" aria-labelledby="class-dist-title">
          <div class="modal-header">
            <h3 id="class-dist-title">HAM10000 Class Distribution</h3>
            <button class="modal-close-btn" data-close="true">${Icons.close}</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px;">
              The HAM10000 dataset contains 10,015 dermatoscopic images collected from the Department of Dermatology at the Medical University of Vienna and the skin cancer practice of Cliff Rosendahl in Queensland, Australia.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${DATASET_INFO.classes.map(c => `
                <div style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px; background: var(--bg-card-subtle);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="color-dot" style="background-color: ${c.color};"></span>
                      <strong style="color: var(--text-heading); font-size: 13px;">${c.name} (${c.code.toUpperCase()})</strong>
                      <span class="status-pill ${c.type === 'Benign' ? 'benign' : 'malignant'}" style="font-size: 10px; padding: 1px 6px;">${c.type}</span>
                    </div>
                    <div style="font-weight: 700; font-size: 12.5px; color: var(--text-heading);">${c.count.toLocaleString()} images (${c.percentage}%)</div>
                  </div>
                  <div class="progress-track" style="height: 6px; margin-bottom: 6px;">
                    <div class="progress-fill" style="width: ${c.percentage}%; background: ${c.color};"></div>
                  </div>
                  <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${c.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="hero-cta-btn" data-close="true" style="padding: 8px 18px; font-size: 13px;">Close</button>
          </div>
        </div>
      </div>

      <!-- Lightbox Zoom Modal -->
      <div class="modal-overlay" id="modal-lightbox">
        <div class="modal-container" style="max-width: 560px; background: #000; border-color: #333;" role="dialog" aria-modal="true">
          <div class="modal-header" style="border-color: #222; color: white;">
            <h3 id="lightbox-title" style="color: white; font-size: 15px;">Image View</h3>
            <button class="modal-close-btn" data-close="true" style="color: #bbb;">${Icons.close}</button>
          </div>
          <div class="modal-body" style="padding: 12px; text-align: center; background: #000;">
            <img id="lightbox-img" src="" alt="Enlarged" style="max-height: 70vh; width: auto; max-width: 100%; border-radius: 8px; margin: 0 auto;" />
          </div>
          <div class="modal-footer" style="border-color: #222; background: #0a0a0a;">
            <button type="button" class="sample-pill-btn" data-close="true" style="color: white; border-color: #444;">Done</button>
          </div>
        </div>
      </div>

      <!-- Toast Notification Container -->
      <div class="toast-container" id="toast-container"></div>
    `;
  }

  attachGlobalEvents() {
    // Close button delegate
    this.container.querySelectorAll('[data-close="true"]').forEach(el => {
      el.addEventListener('click', () => {
        store.closeModal();
      });
    });

    // Close on overlay backdrop click
    this.container.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          store.closeModal();
        }
      });
    });

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.getState().activeModal) {
        store.closeModal();
      }
    });

    // Setup upload modal functionality
    this.attachUploadEvents();

    // Setup settings modal functionality
    this.attachSettingsEvents();

    // Setup Toast listener
    store.subscribe('toast', (toast) => {
      this.showToastElement(toast);
    });
  }

  attachUploadEvents() {
    const fileInput = this.container.querySelector('#modal-file-input');
    const dropzone = this.container.querySelector('#modal-dropzone');
    const browseBtn = this.container.querySelector('#modal-browse-btn');
    const analyzeBtn = this.container.querySelector('#btn-run-analysis');
    const removeBtn = this.container.querySelector('#upload-remove-btn');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    // Drag & Drop
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    // Remove image
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.resetUploadState();
      });
    }

    // Sample benchmark quick pickers
    this.container.querySelectorAll('[data-sample-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-sample-id');
        const sample = SAMPLE_LESIONS.find(s => s.id === id);
        if (sample) {
          this.uploadedFile = sample.originalImage;
          this.showPreview(sample.originalImage, `${sample.name} (${sample.code.toUpperCase()})`);
          analyzeBtn.disabled = false;
        }
      });
    });

    // Run AI Analysis Button
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        if (!this.uploadedFile) return;

        // Show loading state
        const normalState = this.container.querySelector('#upload-state-normal');
        const loadingState = this.container.querySelector('#upload-state-loading');
        const footer = this.container.querySelector('#upload-modal-footer');
        const titleEl = this.container.querySelector('#loading-step-title');
        const descEl = this.container.querySelector('#loading-step-desc');
        const barEl = this.container.querySelector('#loading-bar-fill');

        normalState.style.display = 'none';
        loadingState.style.display = 'block';
        footer.style.display = 'none';

        try {
          const result = await predictionService.analyze(this.uploadedFile, (stepText, percent) => {
            if (titleEl) titleEl.textContent = stepText;
            if (barEl) barEl.style.width = `${percent}%`;
          });

          // Update active analysis in store
          store.setAnalysis(result);
          store.showToast(`Classification complete: ${result.name} (${result.confidence}%)`, 'success');

          // Close modal and reset
          setTimeout(() => {
            store.closeModal();
            this.resetUploadState();
          }, 400);

        } catch (err) {
          console.error(err);
          store.showToast('Analysis error: ' + err.message, 'error');
          normalState.style.display = 'block';
          loadingState.style.display = 'none';
          footer.style.display = 'flex';
        }
      });
    }
  }

  handleFileSelected(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)/)) {
      store.showToast('Invalid file format. Please upload JPG, PNG, or WEBP.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      store.showToast('Image size exceeds 15MB limit.', 'error');
      return;
    }

    this.uploadedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.showPreview(e.target.result, file.name, (file.size / 1024).toFixed(1) + ' KB');
      const analyzeBtn = this.container.querySelector('#btn-run-analysis');
      if (analyzeBtn) analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  showPreview(src, name, extra = '') {
    const previewContainer = this.container.querySelector('#upload-preview-container');
    const previewImg = this.container.querySelector('#upload-preview-img');
    const nameEl = this.container.querySelector('#upload-file-name');
    const sizeEl = this.container.querySelector('#upload-file-size');

    if (previewContainer && previewImg) {
      previewImg.src = src;
      nameEl.textContent = name;
      sizeEl.textContent = extra || 'Verified sample lesion ready for analysis';
      previewContainer.style.display = 'block';
    }
  }

  resetUploadState() {
    this.uploadedFile = null;
    const fileInput = this.container.querySelector('#modal-file-input');
    if (fileInput) fileInput.value = '';
    const previewContainer = this.container.querySelector('#upload-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const analyzeBtn = this.container.querySelector('#btn-run-analysis');
    if (analyzeBtn) analyzeBtn.disabled = true;

    const normalState = this.container.querySelector('#upload-state-normal');
    const loadingState = this.container.querySelector('#upload-state-loading');
    const footer = this.container.querySelector('#upload-modal-footer');
    if (normalState) normalState.style.display = 'block';
    if (loadingState) loadingState.style.display = 'none';
    if (footer) footer.style.display = 'flex';
  }

  attachSettingsEvents() {
    const modeSelect = this.container.querySelector('#settings-mode-select');
    const endpointInput = this.container.querySelector('#settings-endpoint-input');
    const thresholdSlider = this.container.querySelector('#settings-threshold-slider');
    const thresholdLabel = this.container.querySelector('#threshold-val-label');
    const saveBtn = this.container.querySelector('#btn-save-settings');
    const resetBtn = this.container.querySelector('#btn-reset-settings');

    const themeLight = this.container.querySelector('#theme-btn-light');
    const themeDark = this.container.querySelector('#theme-btn-dark');

    themeLight?.addEventListener('click', () => store.setTheme('light'));
    themeDark?.addEventListener('click', () => store.setTheme('dark'));

    thresholdSlider?.addEventListener('input', (e) => {
      thresholdLabel.textContent = `${e.target.value}%`;
    });

    saveBtn?.addEventListener('click', () => {
      const mode = modeSelect.value;
      const endpoint = endpointInput.value.trim() || 'http://localhost:8000/predict';
      const threshold = parseFloat(thresholdSlider.value);

      predictionService.configure(endpoint, mode);
      store.updateSettings({ mode, apiEndpoint: endpoint, confidenceThreshold: threshold });
      store.closeModal();
    });

    resetBtn?.addEventListener('click', () => {
      modeSelect.value = 'simulation';
      endpointInput.value = 'http://localhost:8000/predict';
      thresholdSlider.value = 50;
      thresholdLabel.textContent = '50%';
      predictionService.configure('http://localhost:8000/predict', 'simulation');
      store.updateSettings({ mode: 'simulation', apiEndpoint: 'http://localhost:8000/predict', confidenceThreshold: 50.0 });
    });
  }

  handleModalChange(activeModal, data) {
    this.container.querySelectorAll('.modal-overlay').forEach(el => {
      el.classList.remove('active');
    });

    if (!activeModal) return;

    const modalEl = this.container.querySelector(`#modal-${activeModal}`);
    if (modalEl) {
      modalEl.classList.add('active');

      if (activeModal === 'lightbox' && data) {
        const img = modalEl.querySelector('#lightbox-img');
        const title = modalEl.querySelector('#lightbox-title');
        if (img) img.src = data.src;
        if (title) title.textContent = data.title || 'Enlarged Image';
      }
    }
  }

  showToastElement(toast) {
    const container = this.container.querySelector('#toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <span>${toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${toast.message}</span>
    `;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }
}
