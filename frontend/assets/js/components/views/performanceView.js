/**
 * Model Performance View Component
 * SkinScan AI - Detailed Metrics, Confusion Matrix & Training Analytics
 */

import { Icons } from '../icons.js';
import { OVERALL_METRICS, TRAINING_PROGRESS, CLASS_METRICS, CONFUSION_MATRIX, MODEL_SPECS } from '../../data/modelMetrics.js';
import { store } from '../../state.js';

export class PerformanceView {
  constructor(container) {
    this.container = container;
    this.activeChartMode = 'accuracy'; // 'accuracy' | 'loss'
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
            <h1 style="font-size: 24px; font-weight: 800; color: var(--text-heading);">Model Performance & Evaluation</h1>
            <p style="color: var(--text-muted); font-size: 13px;">
              Evaluation metrics on the test partition of HAM10000 using fine-tuned ResNet-50.
            </p>
          </div>
          <button class="hero-cta-btn" id="btn-perf-analyze" style="padding: 10px 20px; font-size: 13.5px;">
            ${Icons.analyze}
            <span>Test Model with New Image</span>
          </button>
        </div>

        <!-- 5 Key Metrics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
          <div class="card" style="padding: 18px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">TOP-1 ACCURACY</div>
            <div style="font-size: 30px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${OVERALL_METRICS.accuracy}%</div>
            <div style="font-size: 11px; color: var(--status-benign-text); margin-top: 2px;">+18.4% vs baseline CNN</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">MACRO PRECISION</div>
            <div style="font-size: 30px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${OVERALL_METRICS.precision}%</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Balanced across 7 classes</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">MACRO RECALL</div>
            <div style="font-size: 30px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${OVERALL_METRICS.recall}%</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Sensitivity on rare classes</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">MACRO F1 SCORE</div>
            <div style="font-size: 30px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${OVERALL_METRICS.f1Score}%</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Harmonic mean (P & R)</div>
          </div>
          <div class="card" style="padding: 18px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">AREA UNDER ROC</div>
            <div style="font-size: 30px; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${OVERALL_METRICS.aucRoc}%</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Multi-class one-vs-rest</div>
          </div>
        </div>

        <!-- 50 Epochs History Interactive Chart -->
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-heading);">50-Epoch Convergence & Loss Curves</h3>
              <p style="font-size: 12px; color: var(--text-muted);">Learning progression monitored over 50 epochs with early checkpoint saving.</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="sample-pill-btn ${this.activeChartMode === 'accuracy' ? 'active' : ''}" id="btn-chart-acc">Accuracy</button>
              <button class="sample-pill-btn ${this.activeChartMode === 'loss' ? 'active' : ''}" id="btn-chart-loss">Loss</button>
            </div>
          </div>

          <div style="height: 220px; width: 100%; position: relative;">
            ${this.renderLargeChart()}
          </div>
        </div>

        <!-- Confusion Matrix & Per-Class Metrics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Confusion Matrix Heatmap -->
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Normalized Confusion Matrix (%)</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 11.5px;">
                <thead>
                  <tr>
                    <th style="padding: 6px; color: var(--text-muted); text-align: left;">True \\ Pred</th>
                    ${CONFUSION_MATRIX.labels.map(l => `<th style="padding: 6px; font-weight: 700; color: var(--text-heading);">${l.toUpperCase()}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${CONFUSION_MATRIX.matrix.map((row, rIdx) => `
                    <tr>
                      <td style="padding: 6px; font-weight: 700; text-align: left; color: var(--text-heading);">${CONFUSION_MATRIX.labels[rIdx].toUpperCase()}</td>
                      ${row.map(val => {
                        const alpha = Math.min(1, Math.max(0.08, val / 100));
                        return `
                          <td style="padding: 6px; background-color: rgba(59, 130, 246, ${alpha * 0.7}); color: ${val > 45 ? '#fff' : 'var(--text-heading)'}; font-weight: 600; border-radius: 4px;" title="True ${CONFUSION_MATRIX.labels[rIdx]} -> Pred ${val}%">
                            ${val.toFixed(1)}%
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Per-Class Metrics Table -->
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Per-Class Performance</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${CLASS_METRICS.map(cm => `
                <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; background: var(--bg-card-subtle);">
                  <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 12.5px; margin-bottom: 4px;">
                    <span style="color: var(--text-heading);">${cm.name} (${cm.code.toUpperCase()})</span>
                    <span style="color: var(--primary-600);">F1: ${cm.f1}%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                    <span>Precision: <strong>${cm.precision}%</strong></span>
                    <span>Recall: <strong>${cm.recall}%</strong></span>
                    <span>Support: <strong>${cm.support}</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderLargeChart() {
    const isAcc = this.activeChartMode === 'accuracy';
    const width = 800;
    const height = 200;
    const padL = 36;
    const padR = 20;
    const padT = 16;
    const padB = 28;

    const chartW = width - padL - padR;
    const chartH = height - padT - padB;
    const points = TRAINING_PROGRESS;

    const getY = (val) => {
      if (isAcc) {
        return padT + (1.0 - val) * chartH;
      } else {
        // Loss from 0.0 to 2.0
        return padT + (1.0 - (val / 2.0)) * chartH;
      }
    };

    const getX = (epoch) => padL + (epoch / 50) * chartW;

    const trainPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.epoch).toFixed(1)} ${getY(isAcc ? p.train : p.trainLoss).toFixed(1)}`).join(' ');
    const valPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.epoch).toFixed(1)} ${getY(isAcc ? p.val : p.valLoss).toFixed(1)}`).join(' ');

    return `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;" preserveAspectRatio="none">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1.0].map(frac => {
          const y = padT + (1.0 - frac) * chartH;
          const label = isAcc ? `${(frac * 100).toFixed(0)}%` : (frac * 2.0).toFixed(1);
          return `
            <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3,3" />
            <text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.45">${label}</text>
          `;
        }).join('')}

        <!-- X Ticks -->
        ${[0, 10, 20, 30, 40, 50].map(ep => {
          const x = getX(ep);
          return `
            <text x="${x}" y="${height - 8}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.45">Epoch ${ep}</text>
          `;
        }).join('')}

        <!-- Validation Curve -->
        <path d="${valPath}" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="4,4" />
        <!-- Training Curve -->
        <path d="${trainPath}" fill="none" stroke="#2563eb" stroke-width="3" />
      </svg>
    `;
  }

  attachEvents() {
    this.container.querySelector('#btn-perf-analyze')?.addEventListener('click', () => {
      store.setView('analyze');
    });

    this.container.querySelector('#btn-chart-acc')?.addEventListener('click', () => {
      this.activeChartMode = 'accuracy';
      this.render();
      this.attachEvents();
    });

    this.container.querySelector('#btn-chart-loss')?.addEventListener('click', () => {
      this.activeChartMode = 'loss';
      this.render();
      this.attachEvents();
    });
  }
}
