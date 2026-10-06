/**
 * Main Application Bootstrap & Router
 * SkinScan AI - AI-Powered Skin Lesion Analysis
 */

import { store } from './state.js';
import { SidebarComponent } from './components/sidebar.js';
import { HeaderComponent } from './components/header.js';
import { ModalsComponent } from './components/modals.js';
import { HomeView } from './components/views/homeView.js';
import { AnalyzeView } from './components/views/analyzeView.js';
import { DatasetView } from './components/views/datasetView.js';
import { PerformanceView } from './components/views/performanceView.js';
import { AboutView } from './components/views/aboutView.js';

class SkinScanApp {
  constructor() {
    this.currentViewInstance = null;
    this.viewContainer = null;
  }

  init() {
    console.log('🔬 Initializing SkinScan AI Application...');

    // Mount core layout components
    const sidebarEl = document.getElementById('sidebar-container');
    const headerEl = document.getElementById('header-container');
    const modalsEl = document.getElementById('modals-container');
    this.viewContainer = document.getElementById('main-view-container');

    if (sidebarEl) new SidebarComponent(sidebarEl);
    if (headerEl) new HeaderComponent(headerEl);
    if (modalsEl) new ModalsComponent(modalsEl);

    // Setup hash-based URL routing
    this.setupRouting();

    // Listen to state view changes
    store.subscribe('viewChange', (view) => {
      this.renderView(view);
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile backdrop click closes sidebar
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.remove('open');
        backdrop.classList.remove('open');
      });
    }

    // Initial render from hash or default home
    const initialView = window.location.hash.replace('#', '') || 'home';
    store.setView(initialView);
    this.renderView(initialView);

    console.log('✅ SkinScan AI initialized successfully!');
  }

  setupRouting() {
    window.addEventListener('hashchange', () => {
      const hashView = window.location.hash.replace('#', '');
      const validViews = ['home', 'analyze', 'dataset', 'performance', 'about'];
      if (validViews.includes(hashView)) {
        store.setView(hashView);
      }
    });
  }

  renderView(viewName) {
    if (!this.viewContainer) return;

    this.viewContainer.innerHTML = '';

    switch (viewName) {
      case 'analyze':
        this.currentViewInstance = new AnalyzeView(this.viewContainer);
        break;
      case 'dataset':
        this.currentViewInstance = new DatasetView(this.viewContainer);
        break;
      case 'performance':
        this.currentViewInstance = new PerformanceView(this.viewContainer);
        break;
      case 'about':
        this.currentViewInstance = new AboutView(this.viewContainer);
        break;
      case 'home':
      default:
        this.currentViewInstance = new HomeView(this.viewContainer);
        break;
    }
  }
}

// ES modules are deferred by spec — DOM is ready when this runs
const app = new SkinScanApp();
app.init();
