/**
 * Analyze Image Studio View
 * SkinScan AI - Comprehensive Interactive Lesion Analysis & Explainability Studio
 */

import { Icons } from '../icons.js';
import { store } from '../../state.js';
import { predictionService } from '../../services/predictionService.js';
import { ExportService } from '../../services/exportService.js';
import { SAMPLE_LESIONS } from '../../data/sampleLesions.js';

export class AnalyzeView {
  constructor(container) {
    this.container = container;
    this.selectedFile = null;
    this.currentImageSrc = null;
    this.heatMapSrc = null;
    this.blendOpacity = 50;
    this.brightness = 100;
    this.contrast = 100;
    this.init();
  }

  init() {
    // Start with current active analysis
    const analysis = store.getState().activeAnalysis;
    this.currentImageSrc = analysis.originalImage;
    this.heatMapSrc = analysis.gradcamImage;
    this.render();
    this.attachEvents();
    store.subscribe('analysisChange', () => {
      const updated = store.getState().activeAnalysis;
      this.currentImageSrc = updated.originalImage;
      this.heatMapSrc = updated.gradcamImage;
      this.render();
      this.attachEvents();
    });
  }

  render() {
    const analysis = store.getState().activeAnalysis;
    const isBenign = analysis.type === 'Benign';

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Top Title Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: var(--text-heading);">Interactive Analysis Studio</h1>
            <p style="color: var(--text-muted); font-size: 13px;">Upload, inspect, adjust, and classify dermoscopic skin lesion images with Grad-CAM heatmaps.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="sample-pill-btn" id="btn-export-pdf" style="gap: 8px;">
              ${Icons.printer}
              <span>Print / PDF Report</span>
            </button>
            <button class="sample-pill-btn" id="btn-export-json" style="gap: 8px;">
              ${Icons.download}
              <span>Export JSON</span>
            </button>
            <button class="sample-pill-btn" id="btn-reset-studio" style="gap: 8px; color: var(--status-malignant-text);">
              ${Icons.refresh}
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Studio Grid -->
        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; align-items: start;">
          <!-- Left: Image Viewer, Controls, and Upload Area -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Interactive Visualizer Card -->
            <div class="card" style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="card-title-icon">${Icons.eye}</span>
                  <h3 style="font-size: 15px; font-weight: 700;">Visual Inspection & Grad-CAM Blend</h3>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  Scan ID: <strong>${analysis.lesionId || 'ISIC_CURRENT'}</strong>
                </div>
              </div>

              <!-- Main Canvas / Image Comparison Display -->
              <div style="position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--radius-xl); overflow: hidden; background: #0b0f19; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;" id="studio-viewport">
                <!-- Underlay: Original Image -->
                <img id="studio-orig-img" src="${this.currentImageSrc}" alt="Original Lesion" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(${this.brightness}%) contrast(${this.contrast}%);" />
                
                <!-- Overlay: Heatmap with adjustable opacity -->
                <img id="studio-heat-img" src="${this.heatMapSrc}" alt="Grad-CAM Heatmap" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: ${this.blendOpacity / 100}; mix-blend-mode: screen;" />

                <!-- Scanning Line Animation (active when analyzing) -->
                <div class="animate-scan-line" id="studio-scan-line" style="display: none;"></div>

                <!-- Floating Indicator Badges -->
                <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px; z-index: 5;">
                  <span class="image-tag-pill">Original</span>
                  <span class="image-tag-pill" style="background: rgba(79, 70, 229, 0.85);">Grad-CAM (${this.blendOpacity}%)</span>
                </div>
              </div>

              <!-- Controls Toolbar -->
              <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--bg-card-subtle); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                <!-- Opacity Slider -->
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                    <span style="color: var(--text-heading);">Grad-CAM Blend Intensity</span>
                    <span style="color: var(--primary-600);" id="opacity-label">${this.blendOpacity}%</span>
                  </div>
                  <input type="range" id="blend-slider" min="0" max="100" value="${this.blendOpacity}" style="width: 100%;" />
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-subtle); margin-top: 2px;">
                    <span>0% (Original Image)</span>
                    <span>50% (Standard Overlay)</span>
                    <span>100% (Pure Attention)</span>
                  </div>
                </div>

                <!-- Image Adjustments (Brightness / Contrast) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 8px; border-top: 1px dashed var(--border-color);">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 500; margin-bottom: 2px;">
                      <span style="color: var(--text-muted);">Brightness</span>
                      <span id="brightness-label">${this.brightness}%</span>
                    </div>
                    <input type="range" id="brightness-slider" min="50" max="150" value="${this.brightness}" style="width: 100%;" />
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 500; margin-bottom: 2px;">
                      <span style="color: var(--text-muted);">Contrast</span>
                      <span id="contrast-label">${this.contrast}%</span>
                    </div>
                    <input type="range" id="contrast-slider" min="50" max="150" value="${this.contrast}" style="width: 100%;" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload & Sample Selection Card -->
            <div class="card" style="padding: 20px;">
              <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">Input Lesion Image</h3>

              <input type="file" id="studio-file-input" accept="image/jpeg,image/png,image/webp" style="display: none;" />

              <div class="dropzone" id="studio-dropzone" style="padding: 20px;">
                <div class="dropzone-icon" style="width: 40px; height: 40px;">${Icons.upload}</div>
                <h4 style="font-size: 14px;">Drag & Drop or Choose Image</h4>
                <p style="font-size: 11.5px;">JPG, PNG or WEBP from dermatoscope or camera</p>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <button type="button" class="sample-pill-btn" id="studio-browse-btn" style="background: white; border-color: var(--primary-500); color: var(--primary-600); font-weight: 600;">
                    Choose File
                  </button>
                  <button type="button" class="sample-pill-btn" id="studio-camera-btn">
                    ${Icons.camera}
                    <span>Camera</span>
                  </button>
                </div>
              </div>

              <!-- Benchmark Sample Quick Selector -->
              <div style="margin-top: 14px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                  Load Benchmark Case from HAM10000:
                </div>
                <div class="sample-pills-row">
                  ${SAMPLE_LESIONS.map(s => `
                    <button type="button" class="sample-pill-btn ${s.id === analysis.id ? 'active' : ''}" data-studio-sample="${s.id}">
                      <img src="${s.originalImage}" class="sample-pill-thumb" alt="${s.name}" />
                      <span>${s.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Action Button -->
              <div style="margin-top: 16px; display: flex; gap: 10px;">
                <button type="button" class="hero-cta-btn" id="btn-studio-analyze" style="flex-grow: 1; justify-content: center;">
                  ${Icons.analyze}
                  <span>Run ResNet50 Analysis</span>
                  ${Icons.arrowRight}
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Diagnostic Results, Probabilities & Clinical Notes -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Primary Diagnosis Card -->
            <div class="card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <span class="status-pill ${isBenign ? 'benign' : 'malignant'}" style="margin-bottom: 8px;">
                    ${Icons.check}
                    <span>${analysis.type}</span>
                  </span>
                  <h2 style="font-size: 24px; font-weight: 800; color: var(--text-heading); margin-top: 4px;">
                    ${analysis.name}
                  </h2>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    ${analysis.patientInfo || 'Clinical Reference Case'} • ${analysis.lesionId || 'HAM_SAMPLE'}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">CONFIDENCE</div>
                  <div style="font-size: 28px; font-weight: 800; color: var(--primary-600); line-height: 1;">
                    ${analysis.confidence}%
                  </div>
                </div>
              </div>

              <!-- Confidence Progress Bar -->
              <div class="progress-track" style="height: 8px; margin: 8px 0 16px 0;">
                <div class="progress-fill" style="width: ${analysis.confidence}%;"></div>
              </div>

              <!-- Clinical Interpretation -->
              <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 14px; margin-bottom: 18px;">
                <div style="font-size: 12px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px;">
                  Visual Explanation Summary (Grad-CAM)
                </div>
                <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
                  ${analysis.explanation || 'The heatmap highlights regions of high convolutional attention that contributed most strongly to this classification.'}
                </p>
              </div>

              <!-- Full 7-Class Probabilities -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); display: flex; justify-content: space-between;">
                  <span>All Class Probabilities</span>
                  <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">Softmax output distribution</span>
                </div>

                ${(analysis.allProbabilities || []).map(item => `
                  <div style="display: grid; grid-template-columns: 180px 1fr 50px; align-items: center; gap: 12px; font-size: 12.5px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="color-dot" style="background-color: ${item.color || '#3b82f6'};"></span>
                      <span style="font-weight: 500; color: var(--text-heading);">${item.name}</span>
                    </div>
                    <div class="progress-track" style="height: 7px;">
                      <div class="progress-fill" style="width: ${item.percent}%; background: ${item.color || '#3b82f6'};"></div>
                    </div>
                    <div style="text-align: right; font-weight: 700; color: var(--text-heading); font-size: 12px;">
                      ${item.percent}%
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Risk Stratification & Clinical Guidance -->
            <div class="card" style="padding: 20px; border-left: 4px solid ${isBenign ? 'var(--status-benign-text)' : 'var(--status-malignant-text)'};">
              <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--text-heading);">
                ${isBenign ? 'Low Risk: Follow Routine Dermoscopic Surveillance' : 'Elevated Risk: Urgent Dermatological Biopsy Recommended'}
              </h3>
              <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
                ${isBenign
                  ? 'The lesion exhibits features consistent with a benign pattern. Periodic monitoring according to ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolution) is advised.'
                  : 'The AI model detected high activation in asymmetric or atypical pigment networks. A formal dermoscopic evaluation and histological biopsy by a qualified dermatologist is strongly advised.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Opacity slider
    const blendSlider = this.container.querySelector('#blend-slider');
    const heatImg = this.container.querySelector('#studio-heat-img');
    const opacityLabel = this.container.querySelector('#opacity-label');

    if (blendSlider && heatImg) {
      blendSlider.addEventListener('input', (e) => {
        this.blendOpacity = e.target.value;
        heatImg.style.opacity = this.blendOpacity / 100;
        if (opacityLabel) opacityLabel.textContent = `${this.blendOpacity}%`;
      });
    }

    // Brightness & Contrast sliders
    const bSlider = this.container.querySelector('#brightness-slider');
    const cSlider = this.container.querySelector('#contrast-slider');
    const origImg = this.container.querySelector('#studio-orig-img');
    const bLabel = this.container.querySelector('#brightness-label');
    const cLabel = this.container.querySelector('#contrast-label');

    const updateFilters = () => {
      if (origImg) origImg.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
    };

    if (bSlider) {
      bSlider.addEventListener('input', (e) => {
        this.brightness = e.target.value;
        if (bLabel) bLabel.textContent = `${this.brightness}%`;
        updateFilters();
      });
    }

    if (cSlider) {
      cSlider.addEventListener('input', (e) => {
        this.contrast = e.target.value;
        if (cLabel) cLabel.textContent = `${this.contrast}%`;
        updateFilters();
      });
    }

    // Export Buttons
    this.container.querySelector('#btn-export-pdf')?.addEventListener('click', () => {
      ExportService.printReport(store.getState().activeAnalysis);
    });

    this.container.querySelector('#btn-export-json')?.addEventListener('click', () => {
      ExportService.downloadJson(store.getState().activeAnalysis);
    });

    this.container.querySelector('#btn-reset-studio')?.addEventListener('click', () => {
      store.clearHistory();
    });

    // Sample Picker
    this.container.querySelectorAll('[data-studio-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-studio-sample');
        const s = SAMPLE_LESIONS.find(item => item.id === id);
        if (s) {
          store.setAnalysis(s);
          store.showToast(`Loaded benchmark sample: ${s.name}`, 'info');
        }
      });
    });

    // File input & Drag/Drop
    const fileInput = this.container.querySelector('#studio-file-input');
    const browseBtn = this.container.querySelector('#studio-browse-btn');
    const dropzone = this.container.querySelector('#studio-dropzone');
    const analyzeBtn = this.container.querySelector('#btn-studio-analyze');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleStudioFile(e.target.files[0]);
        }
      });
    }

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
          this.handleStudioFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Camera button
    this.container.querySelector('#studio-camera-btn')?.addEventListener('click', () => {
      this.triggerCameraCapture();
    });

    // Analyze Button
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        const scanLine = this.container.querySelector('#studio-scan-line');
        if (scanLine) scanLine.style.display = 'block';
        analyzeBtn.disabled = true;

        try {
          const inputToAnalyze = this.selectedFile || this.currentImageSrc;
          const result = await predictionService.analyze(inputToAnalyze);
          store.setAnalysis(result);
          store.showToast(`Inference complete: ${result.name} (${result.confidence}%)`, 'success');
        } catch (err) {
          store.showToast('Analysis error: ' + err.message, 'error');
        } finally {
          if (scanLine) scanLine.style.display = 'none';
          analyzeBtn.disabled = false;
        }
      });
    }
  }

  handleStudioFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)/)) {
      store.showToast('Please upload a valid JPG, PNG, or WEBP image.', 'error');
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentImageSrc = e.target.result;
      const origImg = this.container.querySelector('#studio-orig-img');
      if (origImg) origImg.src = this.currentImageSrc;
      store.showToast(`Selected image: ${file.name}. Click 'Run ResNet50 Analysis'`, 'info');
    };
    reader.readAsDataURL(file);
  }

  triggerCameraCapture() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      store.showToast('Camera access is not supported on this browser or connection.', 'error');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 450;

        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, 450, 450);
          stream.getTracks().forEach(t => t.stop());
          canvas.toBlob(blob => {
            this.handleStudioFile(new File([blob], 'camera_lesion.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.95);
        }, 1500);
        store.showToast('Capturing dermoscopic image from camera...', 'info');
      })
      .catch(err => {
        store.showToast('Camera access permission denied or unavailable.', 'error');
      });
  }
}
