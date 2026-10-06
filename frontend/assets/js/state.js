/**
 * Centralized State Management Store
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

import { SAMPLE_LESIONS } from '../data/sampleLesions.js';

class StateStore {
  constructor() {
    this.subscribers = new Map();

    const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
    const savedTheme = (storage && storage.getItem('skinscan_theme')) || 'light';
    const savedEndpoint = (storage && storage.getItem('skinscan_api_endpoint')) || 'http://localhost:8000/predict';
    const savedMode = (storage && storage.getItem('skinscan_api_mode')) || 'simulation';

    this.state = {
      currentView: 'home',
      theme: savedTheme,
      // Active analysis default matches reference screenshot (Melanocytic Nevus 82.4%)
      activeAnalysis: { ...SAMPLE_LESIONS[0] },
      recentAnalyses: [...SAMPLE_LESIONS],
      isAnalyzing: false,
      analysisProgress: 0,
      analysisStep: '',
      activeModal: null,
      modalData: null,
      lightboxData: null,
      settings: {
        apiEndpoint: savedEndpoint,
        mode: savedMode,
        confidenceThreshold: 50.0,
        enableNotifications: true,
        autoSaveReport: false
      },
      toast: null
    };

    // Apply theme to document on init
    if (typeof document !== 'undefined' && document.documentElement) {
      this.applyTheme(savedTheme);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
    return () => this.subscribers.get(event).delete(callback);
  }

  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('State subscriber error:', e); }
      });
    }
    // Also notify global wildcard listeners
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => {
        try { cb(event, data); } catch (e) { console.error('Global state subscriber error:', e); }
      });
    }
  }

  setView(viewName) {
    if (this.state.currentView === viewName) return;
    this.state.currentView = viewName;
    this.notify('viewChange', viewName);
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.state.theme = theme;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('skinscan_theme', theme);
    }
    this.applyTheme(theme);
    this.notify('themeChange', theme);
  }

  applyTheme(theme) {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  setAnalysis(analysis) {
    this.state.activeAnalysis = { ...analysis };
    this.addRecentAnalysis(analysis);
    this.notify('analysisChange', this.state.activeAnalysis);
  }

  addRecentAnalysis(analysis) {
    // Avoid duplicate IDs
    const exists = this.state.recentAnalyses.findIndex(a => a.id === analysis.id || a.lesionId === analysis.lesionId);
    if (exists >= 0) {
      this.state.recentAnalyses.splice(exists, 1);
    }
    this.state.recentAnalyses.unshift(analysis);
    // Keep max 10 recent
    if (this.state.recentAnalyses.length > 10) {
      this.state.recentAnalyses.pop();
    }
    this.notify('recentChange', this.state.recentAnalyses);
  }

  clearHistory() {
    this.state.recentAnalyses = [{ ...SAMPLE_LESIONS[0] }];
    this.notify('recentChange', this.state.recentAnalyses);
    this.showToast('Analysis history cleared', 'info');
  }

  setAnalyzing(isAnalyzing, step = '', progress = 0) {
    this.state.isAnalyzing = isAnalyzing;
    this.state.analysisStep = step;
    this.state.analysisProgress = progress;
    this.notify('analyzingChange', { isAnalyzing, step, progress });
  }

  openModal(modalName, data = null) {
    this.state.activeModal = modalName;
    this.state.modalData = data;
    this.notify('modalChange', { activeModal: modalName, data });
  }

  closeModal() {
    this.state.activeModal = null;
    this.state.modalData = null;
    this.notify('modalChange', { activeModal: null, data: null });
  }

  openLightbox(src, title) {
    this.state.lightboxData = { src, title };
    this.openModal('lightbox', { src, title });
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('skinscan_api_endpoint', this.state.settings.apiEndpoint);
      window.localStorage.setItem('skinscan_api_mode', this.state.settings.mode);
    }
    this.notify('settingsChange', this.state.settings);
    this.showToast('Settings saved successfully', 'success');
  }

  showToast(message, type = 'info') {
    this.state.toast = { message, type, id: Date.now() };
    this.notify('toast', this.state.toast);
  }
}

export const store = new StateStore();
