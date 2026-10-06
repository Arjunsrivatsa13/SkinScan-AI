/**
 * Home View Component
 * SkinScan AI - Matches Reference Image Layout Exactly
 */

import { HeroCardComponent } from '../heroCard.js';
import { FeatureCardsComponent } from '../featureCards.js';
import { RecentAnalysisComponent } from '../recentAnalysis.js';
import { ModelStatsComponent } from '../modelStats.js';
import { Icons } from '../icons.js';

export class HomeView {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Left / Center Column -->
        <div class="dashboard-left">
          <div id="hero-card-container"></div>
          <div id="feature-cards-container"></div>
          <div id="recent-analysis-container"></div>
        </div>

        <!-- Right Column -->
        <div class="dashboard-right" id="model-stats-container"></div>

        <!-- Bottom Full-Width Medical Disclaimer Banner -->
        <div class="disclaimer-banner">
          <div class="disclaimer-left">
            <span class="disclaimer-icon">${Icons.info}</span>
            <div class="disclaimer-text">
              <h4>Medical Disclaimer</h4>
              <p>SkinScan AI is an AI-powered tool for informational purposes only and is not a substitute for professional medical advice, diagnosis or treatment. Always consult a qualified dermatologist or healthcare professional for proper evaluation and care.</p>
            </div>
          </div>
          <div class="disclaimer-right">
            ${Icons.heart}
            <span>Your Health Matters</span>
          </div>
        </div>
      </div>
    `;

    // Initialize sub-components
    new HeroCardComponent(this.container.querySelector('#hero-card-container'));
    new FeatureCardsComponent(this.container.querySelector('#feature-cards-container'));
    new RecentAnalysisComponent(this.container.querySelector('#recent-analysis-container'));
    new ModelStatsComponent(this.container.querySelector('#model-stats-container'));
  }
}
