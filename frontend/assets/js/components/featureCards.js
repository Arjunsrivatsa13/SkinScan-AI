/**
 * Feature Highlight Cards Component
 * SkinScan AI - 3 Feature Cards
 */

import { Icons } from './icons.js';
import { store } from '../state.js';

export class FeatureCardsComponent {
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
      <div class="features-grid">
        <!-- Feature 1: AI Classification -->
        <div class="feature-box" id="feat-classification" style="cursor: pointer;" title="Explore model performance and architectures">
          <div class="feature-icon-wrapper purple">
            ${Icons.chip}
          </div>
          <h3>AI Classification</h3>
          <p>Powered by a fine-tuned ResNet50 model to accurately classify skin lesions into 7 different categories.</p>
        </div>

        <!-- Feature 2: Visual Explanation -->
        <div class="feature-box" id="feat-gradcam" style="cursor: pointer;" title="Learn how Grad-CAM attention heatmaps work">
          <div class="feature-icon-wrapper blue">
            ${Icons.eye}
          </div>
          <h3>Visual Explanation</h3>
          <p>See Grad-CAM heatmaps to understand where the model is focusing and why it made a prediction.</p>
        </div>

        <!-- Feature 3: Probability Analysis -->
        <div class="feature-box" id="feat-probabilities" style="cursor: pointer;" title="Inspect probability distributions">
          <div class="feature-icon-wrapper cyan">
            ${Icons.chart}
          </div>
          <h3>Probability Analysis</h3>
          <p>Get detailed confidence scores and probability distribution across all possible classes.</p>
        </div>
      </div>
    `;
  }

  attachEvents() {
    this.container.querySelector('#feat-classification')?.addEventListener('click', () => {
      store.setView('performance');
    });

    this.container.querySelector('#feat-gradcam')?.addEventListener('click', () => {
      store.setView('about');
    });

    this.container.querySelector('#feat-probabilities')?.addEventListener('click', () => {
      store.openModal('classDistribution');
    });
  }
}
