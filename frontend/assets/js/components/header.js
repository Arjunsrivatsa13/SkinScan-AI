/**
 * Top Header Component
 * SkinScan AI - Theme toggle & Profile dropdown
 */

import { Icons } from './icons.js';
import { store } from '../state.js';

export class HeaderComponent {
  constructor(container) {
    this.container = container;
    this.dropdownOpen = false;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    store.subscribe('themeChange', () => this.updateThemeButton());
  }

  render() {
    const isDark = store.getState().theme === 'dark';

    this.container.innerHTML = `
      <div class="header-left">
        <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Toggle navigation drawer">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="header-right">
        <!-- Theme Toggle Button -->
        <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Light / Dark mode" aria-label="Toggle theme">
          ${isDark ? Icons.moon : Icons.sun}
        </button>

        <!-- User Profile Pill -->
        <div class="user-profile-wrapper" style="position: relative;">
          <button class="user-profile-btn" id="user-profile-btn" aria-haspopup="true" aria-expanded="false">
            <div class="avatar-circle">A</div>
            <span class="user-profile-name">Arjun Srivatsa</span>
            <span class="dropdown-chevron">${Icons.chevronDown}</span>
          </button>

          <!-- Dropdown Menu -->
          <div class="profile-dropdown-menu" id="profile-dropdown-menu">
            <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 4px;">
              <div style="font-weight: 700; font-size: 13px; color: var(--text-heading);">Arjun Srivatsa</div>
              <div style="font-size: 11px; color: var(--text-muted);">Lead Researcher • SkinScan AI</div>
            </div>
            <button class="menu-item" id="menu-btn-settings">
              ${Icons.gear}
              <span>Settings & API</span>
            </button>
            <button class="menu-item" id="menu-btn-classes">
              ${Icons.layers}
              <span>Class Distribution</span>
            </button>
            <button class="menu-item" id="menu-btn-clear">
              ${Icons.refresh}
              <span>Reset Analysis History</span>
            </button>
            <div class="menu-divider"></div>
            <button class="menu-item" id="menu-btn-about" style="color: var(--primary-600);">
              ${Icons.info}
              <span>About Model Specs</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Theme toggle
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    // Mobile menu toggle
    const mobileBtn = this.container.querySelector('#mobile-menu-toggle');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        sidebar?.classList.toggle('open');
        backdrop?.classList.toggle('open');
      });
    }

    // Profile dropdown
    const profileBtn = this.container.querySelector('#user-profile-btn');
    const dropdown = this.container.querySelector('#profile-dropdown-menu');

    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dropdownOpen = !this.dropdownOpen;
        dropdown.classList.toggle('open', this.dropdownOpen);
        profileBtn.classList.toggle('active', this.dropdownOpen);
        profileBtn.setAttribute('aria-expanded', String(this.dropdownOpen));
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
          this.dropdownOpen = false;
          dropdown.classList.remove('open');
          profileBtn.classList.remove('active');
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Menu actions
      this.container.querySelector('#menu-btn-settings')?.addEventListener('click', () => {
        dropdown.classList.remove('open');
        store.openModal('settings');
      });

      this.container.querySelector('#menu-btn-classes')?.addEventListener('click', () => {
        dropdown.classList.remove('open');
        store.openModal('classDistribution');
      });

      this.container.querySelector('#menu-btn-clear')?.addEventListener('click', () => {
        dropdown.classList.remove('open');
        store.clearHistory();
      });

      this.container.querySelector('#menu-btn-about')?.addEventListener('click', () => {
        dropdown.classList.remove('open');
        store.setView('about');
      });
    }
  }

  updateThemeButton() {
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    const isDark = store.getState().theme === 'dark';
    if (themeBtn) {
      themeBtn.innerHTML = isDark ? Icons.moon : Icons.sun;
    }
  }
}
