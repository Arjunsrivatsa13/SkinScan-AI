/**
 * Sidebar Navigation Component
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

import { Icons } from './icons.js';
import { store } from '../state.js';

export class SidebarComponent {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    store.subscribe('viewChange', (view) => this.updateActiveNav(view));
  }

  render() {
    const currentView = store.getState().currentView;

    this.container.innerHTML = `
      <div class="sidebar-brand">
        <div class="brand-icon-wrapper">
          ${Icons.brandLogo}
        </div>
        <div class="brand-text">
          <h1>SkinScan AI</h1>
          <p>AI-Powered Skin Lesion Analysis</p>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Main Navigation">
        <button class="nav-item ${currentView === 'home' ? 'active' : ''}" data-view="home">
          <span class="nav-icon">${Icons.home}</span>
          <span>Home</span>
        </button>
        <button class="nav-item ${currentView === 'analyze' ? 'active' : ''}" data-view="analyze">
          <span class="nav-icon">${Icons.analyze}</span>
          <span>Analyze Image</span>
        </button>
        <button class="nav-item ${currentView === 'dataset' ? 'active' : ''}" data-view="dataset">
          <span class="nav-icon">${Icons.dataset}</span>
          <span>Dataset Info</span>
        </button>
        <button class="nav-item ${currentView === 'performance' ? 'active' : ''}" data-view="performance">
          <span class="nav-icon">${Icons.performance}</span>
          <span>Model Performance</span>
        </button>
        <button class="nav-item ${currentView === 'about' ? 'active' : ''}" data-view="about">
          <span class="nav-icon">${Icons.about}</span>
          <span>About</span>
        </button>
      </nav>

      <div class="sidebar-footer-card">
        <div class="card-icon">
          ${Icons.shield}
        </div>
        <h3>Better Insights for Healthier Tomorrows</h3>
        <p>AI-assisted analysis to support early detection and informed decisions.</p>
        <svg class="wave-art" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 50C30 30 70 70 100 50V100H0V50Z" fill="url(#wave-gradient)" />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stop-color="#818cf8" stop-opacity="0.8"/>
              <stop offset="1" stop-color="#c084fc" stop-opacity="0.4"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    `;
  }

  attachEvents() {
    this.container.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const view = button.getAttribute('data-view');
        if (view) {
          store.setView(view);
          // Close mobile drawer if open
          document.querySelector('.sidebar')?.classList.remove('open');
          document.querySelector('.sidebar-backdrop')?.classList.remove('open');
        }
      });
    });
  }

  updateActiveNav(view) {
    this.container.querySelectorAll('.nav-item').forEach(button => {
      const bView = button.getAttribute('data-view');
      if (bView === view) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}
