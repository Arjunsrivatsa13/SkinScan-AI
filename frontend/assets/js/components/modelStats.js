/**
 * Right Column Statistics & Specifications Component
 * SkinScan AI - Model Performance, Training Curves, Dataset Info, Model Specs
 */

import { Icons } from './icons.js';
import { OVERALL_METRICS, TRAINING_PROGRESS, MODEL_SPECS } from '../data/modelMetrics.js';
import { DATASET_INFO } from '../data/datasetInfo.js';
import { store } from '../state.js';

export class ModelStatsComponent {
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
      <!-- Card 1: Model Performance -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 14px;">
          <div class="card-title-group">
            <span class="card-title-icon">${Icons.performance}</span>
            <h3>Model Performance</h3>
          </div>
        </div>

        <!-- 2x2 Metric Grid -->
        <div class="metrics-grid-2x2">
          <div class="metric-tile">
            <span class="metric-tile-label">Accuracy</span>
            <span class="metric-tile-val">${OVERALL_METRICS.accuracy}%</span>
          </div>
          <div class="metric-tile">
            <span class="metric-tile-label">Precision</span>
            <span class="metric-tile-val">${OVERALL_METRICS.precision}%</span>
          </div>
          <div class="metric-tile">
            <span class="metric-tile-label">Recall</span>
            <span class="metric-tile-val">${OVERALL_METRICS.recall}%</span>
          </div>
          <div class="metric-tile">
            <span class="metric-tile-label">F1 Score</span>
            <span class="metric-tile-val">${OVERALL_METRICS.f1Score}%</span>
          </div>
        </div>

        <!-- Training Progress Line Chart -->
        <div class="training-chart-container">
          <div class="chart-header">
            <span class="chart-title">Training Progress</span>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot-train"></span>
                <span>Train</span>
              </div>
              <div class="legend-item">
                <span class="legend-dash-val"></span>
                <span>Val</span>
              </div>
            </div>
          </div>

          <div class="svg-chart-wrapper" id="training-chart-wrapper">
            ${this.generateSvgChart()}
            <div id="chart-tooltip" style="position: absolute; display: none; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; pointer-events: none; z-index: 10;"></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Dataset Info -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 4px;">
          <div class="card-title-group">
            <span class="card-title-icon">${Icons.dataset}</span>
            <h3>Dataset Info</h3>
          </div>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); margin-top: 6px;">
          ${DATASET_INFO.name}
        </div>

        <div class="dataset-spec-list">
          <div class="dataset-spec-row">
            <div class="spec-name-with-icon">
              ${Icons.image}
              <span>Images</span>
            </div>
            <span class="spec-val-bold">${DATASET_INFO.totalImages.toLocaleString()}</span>
          </div>

          <div class="dataset-spec-row">
            <div class="spec-name-with-icon">
              ${Icons.layers}
              <span>Classes</span>
            </div>
            <span class="spec-val-bold">${DATASET_INFO.numClasses}</span>
          </div>

          <div class="dataset-spec-row">
            <div class="spec-name-with-icon">
              ${Icons.globe}
              <span>Source</span>
            </div>
            <span class="spec-val-bold">${DATASET_INFO.source.split(' / ')[0]}</span>
          </div>
        </div>

        <button class="link-btn" id="btn-view-distribution" aria-label="View class distribution modal">
          <span>View Class Distribution</span>
          ${Icons.arrowRight}
        </button>
      </div>

      <!-- Card 3: About the Model -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 12px;">
          <div class="card-title-group">
            <span class="card-title-icon">${Icons.gear}</span>
            <h3>About the Model</h3>
          </div>
        </div>

        <div class="spec-table">
          <div class="spec-table-row">
            <span class="spec-table-key">Architecture</span>
            <span class="spec-table-val">${MODEL_SPECS.architecture}</span>
          </div>
          <div class="spec-table-row">
            <span class="spec-table-key">Input Size</span>
            <span class="spec-table-val">${MODEL_SPECS.inputSize}</span>
          </div>
          <div class="spec-table-row">
            <span class="spec-table-key">Loss Function</span>
            <span class="spec-table-val">${MODEL_SPECS.lossFunction}</span>
          </div>
          <div class="spec-table-row">
            <span class="spec-table-key">Optimizer</span>
            <span class="spec-table-val">${MODEL_SPECS.optimizer}</span>
          </div>
          <div class="spec-table-row">
            <span class="spec-table-key">Framework</span>
            <span class="spec-table-val">${MODEL_SPECS.framework}</span>
          </div>
        </div>
      </div>
    `;
  }

  generateSvgChart() {
    // Chart dimensions
    const width = 300;
    const height = 130;
    const padLeft = 26;
    const padRight = 10;
    const padTop = 10;
    const padBottom = 22;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Epochs 0 to 50
    const points = TRAINING_PROGRESS;
    const maxEpoch = 50;

    const getX = (epoch) => padLeft + (epoch / maxEpoch) * chartW;
    const getY = (val) => padTop + (1.0 - val) * chartH;

    // Build Train path (solid)
    const trainPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.epoch).toFixed(1)} ${getY(p.train).toFixed(1)}`).join(' ');

    // Build Val path (dashed)
    const valPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.epoch).toFixed(1)} ${getY(p.val).toFixed(1)}`).join(' ');

    // Y Axis ticks: 0, 0.2, 0.4, 0.6, 0.8, 1.0
    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const yTicksSvg = yTicks.map(val => {
      const y = getY(val);
      return `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="2,2"/>
        <text x="${padLeft - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="currentColor" opacity="0.45">${val.toFixed(1)}</text>
      `;
    }).join('');

    // X Axis ticks: 0, 10, 20, 30, 40, 50
    const xTicks = [0, 10, 20, 30, 40, 50];
    const xTicksSvg = xTicks.map(ep => {
      const x = getX(ep);
      return `
        <text x="${x}" y="${height - 4}" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.45">${ep}</text>
      `;
    }).join('');

    return `
      <svg class="svg-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${yTicksSvg}
        ${xTicksSvg}
        <text x="${width / 2}" y="${height + 2}" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">Epoch</text>
        <!-- Val Line (Dashed) -->
        <path d="${valPath}" fill="none" stroke="#93c5fd" stroke-width="1.8" stroke-dasharray="3,3" />
        <!-- Train Line (Solid) -->
        <path d="${trainPath}" fill="none" stroke="#2563eb" stroke-width="2" />
        <!-- Interactive Invisible points for tooltip -->
        ${points.map(p => `
          <circle cx="${getX(p.epoch)}" cy="${getY(p.val)}" r="4" fill="transparent" class="chart-point" data-epoch="${p.epoch}" data-train="${p.train}" data-val="${p.val}" style="cursor: pointer;"/>
        `).join('')}
      </svg>
    `;
  }

  attachEvents() {
    this.container.querySelector('#btn-view-distribution')?.addEventListener('click', () => {
      store.openModal('classDistribution');
    });

    // Chart tooltip interactions
    const wrapper = this.container.querySelector('#training-chart-wrapper');
    const tooltip = this.container.querySelector('#chart-tooltip');

    if (wrapper && tooltip) {
      wrapper.querySelectorAll('.chart-point').forEach(pt => {
        pt.addEventListener('mouseenter', (e) => {
          const ep = pt.getAttribute('data-epoch');
          const tr = (parseFloat(pt.getAttribute('data-train')) * 100).toFixed(1);
          const vl = (parseFloat(pt.getAttribute('data-val')) * 100).toFixed(1);
          tooltip.innerHTML = `<strong>Epoch ${ep}</strong><br/>Train: ${tr}%<br/>Val: ${vl}%`;
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.offsetX + 8}px`;
          tooltip.style.top = `${e.offsetY - 24}px`;
        });
        pt.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
      });
    }
  }
}
