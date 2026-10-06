/**
 * About View Component
 * SkinScan AI - Architecture, Grad-CAM Theory & Clinical Purpose
 */

import { Icons } from '../icons.js';
import { MODEL_SPECS } from '../../data/modelMetrics.js';
import { store } from '../../state.js';

export class AboutView {
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
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 1000px; margin: 0 auto;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: var(--text-heading);">About SkinScan AI</h1>
            <p style="color: var(--text-muted); font-size: 13px;">
              Explainable Artificial Intelligence for Dermoscopic Skin Lesion Analysis.
            </p>
          </div>
          <button class="hero-cta-btn" id="btn-about-try" style="padding: 10px 20px; font-size: 13.5px;">
            ${Icons.analyze}
            <span>Launch Analysis Studio</span>
          </button>
        </div>

        <!-- Vision & Purpose Card -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-heading); margin-bottom: 12px;">
            Clinical Objective & Explainable AI
          </h2>
          <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.6; margin-bottom: 14px;">
            Skin cancer, particularly malignant melanoma, represents one of the fastest-growing oncological challenges worldwide. While early stage detection dramatically increases 5-year survival rates to over 98%, accurate diagnosis can be difficult even for seasoned practitioners.
          </p>
          <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.6;">
            <strong>SkinScan AI</strong> bridges clinical deep learning with visual explainability. Rather than functioning as a black-box classifier, it couples a 50-layer deep Residual Network (ResNet-50) with Gradient-weighted Class Activation Mapping (Grad-CAM), directly revealing the spatial features that guided the network's prediction.
          </p>
        </div>

        <!-- ResNet-50 Architecture Card -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-heading); margin-bottom: 16px;">
            ResNet-50 Deep Residual Network Architecture
          </h2>

          <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</span>
                <div>
                  <strong>Input Preprocessing:</strong> High-resolution dermoscopic image resized to 224 × 224 RGB, normalized to ImageNet statistics (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</span>
                <div>
                  <strong>Residual Feature Extraction:</strong> 4 stages of Bottleneck Residual Blocks featuring identity shortcut connections: F(x) + x, preventing vanishing gradients across 50 layers.
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #8b5cf6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</span>
                <div>
                  <strong>Grad-CAM Visual Hook:</strong> Forward & backward gradient hooks registered onto <code>model.layer4[-1]</code> (the final convolutional block) to compute spatial weight activations.
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">4</span>
                <div>
                  <strong>Classification Head:</strong> Adaptive Average Pooling -> Flatten -> Linear fully connected projection to 7 logit outputs -> Softmax probability distribution.
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            ${Object.entries(MODEL_SPECS).map(([key, val]) => `
              <div style="background: var(--bg-card-subtle); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">${key.replace(/([A-Z])/g, ' $1')}</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); margin-top: 2px;">${val}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Grad-CAM Theory Card -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-heading); margin-bottom: 12px;">
            How Grad-CAM Computes Visual Explanations
          </h2>
          <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
            Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of the target class score flowing into the final convolutional feature maps to produce a coarse localization map highlighting important regions:
          </p>
          <div style="background: var(--bg-card-subtle); padding: 14px; border-radius: var(--radius-md); font-family: monospace; font-size: 12px; color: var(--primary-600); margin-bottom: 14px; border-left: 3px solid var(--primary-600);">
            L_GradCAM^c = ReLU( ∑_k α_k^c · A^k ), where α_k^c = (1/Z) ∑_i ∑_j (∂y^c / ∂A_{i,j}^k)
          </div>
          <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">
            A Rectified Linear Unit (ReLU) is applied to the linear combination of maps because we are only interested in the features that have a positive influence on the selected lesion class. The result is normalized, mapped through the OpenCV JET pseudo-color scale, and superimposed onto the original dermoscopic image.
          </p>
        </div>

        <!-- Rigorous Ethics & Medical Disclaimers -->
        <div class="card" style="padding: 24px; border-left: 4px solid #f59e0b;">
          <h3 style="font-size: 16px; font-weight: 700; color: #b45309; margin-bottom: 8px;">
            Regulatory & Diagnostic Boundaries
          </h3>
          <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.55;">
            SkinScan AI is an educational, scientific research prototype. It is NOT cleared by the FDA or international regulatory bodies for primary diagnostic use. Algorithmic outputs, confidence values, and heatmaps must never replace in-person dermatological examination, dermoscopy, and histopathological tissue biopsy.
          </p>
        </div>
      </div>
    `;
  }

  attachEvents() {
    this.container.querySelector('#btn-about-try')?.addEventListener('click', () => {
      store.setView('analyze');
    });
  }
}
