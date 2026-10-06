/**
 * Automated Test Suite for SkinScan AI Frontend
 * Validates all required user interactions, states, and workflows.
 */

import fs from 'node:fs';
import assert from 'node:assert';

console.log('🧪 Starting SkinScan AI Frontend Automated Interaction Tests...\n');

let testsPassed = 0;
let testsTotal = 0;

function it(desc, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(err);
  }
}

async function itAsync(desc, fn) {
  testsTotal++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(err);
  }
}

// Setup simulated browser environment
globalThis.window = {
  location: { protocol: 'http:', hash: '' },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  scrollTo() {}
};
globalThis.localStorage = globalThis.window.localStorage;

class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.style = {};
    this.attributes = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          force ? this.classList._classes.add(c) : this.classList._classes.delete(c);
        } else {
          this.classList.contains(c) ? this.classList.remove(c) : this.classList.add(c);
        }
      }
    };
    this.children = [];
    this.listeners = {};
    this.innerHTML = '';
    this.value = '';
    this.disabled = false;
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const evType = typeof event === 'string' ? event : event.type;
    const handlers = this.listeners[evType] || [];
    for (const h of handlers) h(event);
  }

  querySelector(sel) {
    return this.children[0] || null;
  }

  querySelectorAll(sel) {
    return [...this.children];
  }
}

globalThis.document = {
  documentElement: new MockElement('html'),
  createElement(tag) { return new MockElement(tag); },
  getElementById(id) { return new MockElement('div'); },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {}
};

// Load application modules
const { store } = await import('./assets/js/state.js');
const { DATASET_INFO } = await import('./assets/data/datasetInfo.js');
const { MODEL_SPECS, OVERALL_METRICS, TRAINING_PROGRESS } = await import('./assets/data/modelMetrics.js');
const { SAMPLE_LESIONS } = await import('./assets/data/sampleLesions.js');
const { predictionService } = await import('./assets/js/services/predictionService.js');

async function runTests() {
  console.log('--- 1. Initial State & Data Tests ---');
  
  it('Initial view is home', () => {
    assert.strictEqual(store.getState().currentView, 'home');
  });

  it('Default active analysis matches reference screenshot (Melanocytic Nevus 82.4%)', () => {
    const active = store.getState().activeAnalysis;
    assert.strictEqual(active.name, 'Melanocytic Nevus');
    assert.strictEqual(active.confidence, 82.4);
    assert.strictEqual(active.type, 'Benign');
    assert.strictEqual(active.topProbabilities.length, 5);
    assert.strictEqual(active.allProbabilities.length, 7);
  });

  it('Dataset contains all 7 HAM10000 classes', () => {
    assert.strictEqual(DATASET_INFO.numClasses, 7);
    assert.strictEqual(DATASET_INFO.classes.length, 7);
    assert.strictEqual(DATASET_INFO.totalImages, 10015);
  });

  it('Model specs reflect fine-tuned ResNet-50 PyTorch', () => {
    assert.strictEqual(MODEL_SPECS.architecture, 'ResNet50 (Fine-tuned)');
    assert.strictEqual(MODEL_SPECS.inputSize, '224 × 224');
    assert.strictEqual(MODEL_SPECS.framework, 'PyTorch');
    assert.strictEqual(OVERALL_METRICS.accuracy, 82.4);
  });

  console.log('\n--- 2. Navigation & View Routing Tests ---');

  it('Navigation changes view state correctly', () => {
    let triggered = null;
    const unsub = store.subscribe('viewChange', (v) => { triggered = v; });

    store.setView('analyze');
    assert.strictEqual(store.getState().currentView, 'analyze');
    assert.strictEqual(triggered, 'analyze');

    store.setView('dataset');
    assert.strictEqual(store.getState().currentView, 'dataset');

    store.setView('performance');
    assert.strictEqual(store.getState().currentView, 'performance');

    store.setView('about');
    assert.strictEqual(store.getState().currentView, 'about');

    store.setView('home');
    assert.strictEqual(store.getState().currentView, 'home');

    unsub();
  });

  console.log('\n--- 3. Theme & Settings Controls Tests ---');

  it('Theme toggles between light and dark and persists to localStorage', () => {
    store.setTheme('light');
    assert.strictEqual(store.getState().theme, 'light');
    assert.strictEqual(globalThis.localStorage.getItem('skinscan_theme'), 'light');

    store.toggleTheme();
    assert.strictEqual(store.getState().theme, 'dark');
    assert.strictEqual(globalThis.localStorage.getItem('skinscan_theme'), 'dark');

    store.toggleTheme();
    assert.strictEqual(store.getState().theme, 'light');
  });

  it('Settings updates and persists API endpoint and mode', () => {
    store.updateSettings({
      apiEndpoint: 'http://127.0.0.1:8000/predict',
      mode: 'live',
      confidenceThreshold: 65.0
    });

    const state = store.getState();
    assert.strictEqual(state.settings.apiEndpoint, 'http://127.0.0.1:8000/predict');
    assert.strictEqual(state.settings.mode, 'live');
    assert.strictEqual(state.settings.confidenceThreshold, 65.0);
    assert.strictEqual(globalThis.localStorage.getItem('skinscan_api_endpoint'), 'http://127.0.0.1:8000/predict');
    assert.strictEqual(globalThis.localStorage.getItem('skinscan_api_mode'), 'live');
  });

  console.log('\n--- 4. Modal Open & Close State Tests ---');

  it('Modals open and close properly with events', () => {
    let modalEvent = null;
    const unsub = store.subscribe('modalChange', (m) => { modalEvent = m; });

    store.openModal('upload');
    assert.strictEqual(store.getState().activeModal, 'upload');
    assert.strictEqual(modalEvent.activeModal, 'upload');

    store.closeModal();
    assert.strictEqual(store.getState().activeModal, null);

    store.openModal('settings');
    assert.strictEqual(store.getState().activeModal, 'settings');

    store.openModal('classDistribution');
    assert.strictEqual(store.getState().activeModal, 'classDistribution');

    store.openLightbox('assets/samples/nv_orig.jpg', 'Melanocytic Nevus');
    assert.strictEqual(store.getState().activeModal, 'lightbox');
    assert.strictEqual(store.getState().lightboxData.src, 'assets/samples/nv_orig.jpg');

    store.closeModal();
    assert.strictEqual(store.getState().activeModal, null);
    unsub();
  });

  console.log('\n--- 5. Prediction Service & Benchmark Samples Tests ---');

  it('Sample benchmark cases load and update active analysis', () => {
    const melSample = SAMPLE_LESIONS.find(s => s.code === 'mel');
    assert.ok(melSample);
    assert.strictEqual(melSample.type, 'Malignant');

    store.setAnalysis(melSample);
    assert.strictEqual(store.getState().activeAnalysis.name, 'Melanoma');
    assert.strictEqual(store.getState().activeAnalysis.type, 'Malignant');
    assert.strictEqual(store.getState().recentAnalyses[0].name, 'Melanoma');
  });

  it('Reset button clears history and restores default', () => {
    store.clearHistory();
    assert.strictEqual(store.getState().recentAnalyses.length, 1);
    assert.strictEqual(store.getState().recentAnalyses[0].name, 'Melanocytic Nevus');
  });

  console.log('\n--- 6. Image Analysis Pipeline & Heuristics Tests ---');

  await itAsync('PredictionService produces full 7-class distribution and confidence', async () => {
    // Switch to simulation mode
    predictionService.configure('http://localhost:8000/predict', 'simulation');
    
    // Simulate analyzing sample image
    const result = predictionService.computeSimulatedResult({}, { gradcamUrl: 'data:image/jpeg;base64,mock' }, 'assets/samples/nv_orig.jpg');
    
    assert.ok(result);
    assert.strictEqual(result.name, 'Melanocytic Nevus');
    assert.strictEqual(result.confidence, 82.4);
    assert.strictEqual(result.type, 'Benign');
    assert.strictEqual(result.topProbabilities.length, 5);
    assert.strictEqual(result.allProbabilities.length, 7);

    // Sum of all 7 probabilities equals 100%
    const sum = result.allProbabilities.reduce((acc, p) => acc + p.percent, 0);
    assert.ok(Math.abs(sum - 100.0) < 0.1, `Sum of probabilities is ${sum}`);
  });

  console.log('\n=======================================');
  console.log(`Test Results: ${testsPassed} / ${testsTotal} PASSED`);
  console.log('=======================================\n');
}

runTests();
