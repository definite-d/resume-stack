/**
 * ResumeStack
 * An alternative to Paystack's InlineJS for modal transaction resumption.
 * Not affiliated with Paystack. Use at your own risk.
 * License: The Unlicense
 */

import { ResumeStackConfig } from "./types";

const PAYSTACK_CHECKOUT = "https://checkout.paystack.com"

// Detect theme preference
function detectTheme(preferred: string | undefined): string {
  if (preferred === 'light') return 'light';
  if (preferred === 'dark') return 'dark';
  if (preferred === 'auto') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

// CSS for modal, respecting themes
function getModalCSS(theme: string, blur: string): string {
  const isDark = theme === 'dark';

  return `
    .resume-stack-modal {
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255 255 255 / 0.75)'};
      backdrop-filter: blur(${blur});
      transition: all 0.2s ease;
    }
    .resume-stack-modal.show {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .resume-stack-content {
      background-color: transparent;
      color: ${isDark ? '#e0e0e0' : '#333'};
      padding: 0;
      border-radius: 0;
      max-width: none;
      width: 100vw;
      height: 100vh;
      box-shadow: none;
      position: static;
    }
    .resume-stack-iframe {
      width: 100%;
      height: 100vh;
      border: none;
      border-radius: 0;
    }
    @media (prefers-color-scheme: dark) {
      .resume-stack-iframe {
        filter: invert(0.95) saturate(1.2) brightness(1.2) hue-rotate(182deg);
      }
    }
    .resume-stack-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: ${isDark ? '#e0e0e0' : '#333'};
    }
    .resume-stack-close:hover {
      opacity: 0.7;
    }
    @media (max-width: 500px) {
      .resume-stack-modal.show {
        align-items: flex-start;
        justify-content: center;
      }
      .resume-stack-content {
        width: 100vw;
        padding: 0;
        height: 100vh;
        border-radius: 0;
      }
      .resume-stack-iframe {
        height: 100vh;
      }
    }
  `;
}

class ResumeStack {
  private accessCode: string;
  private onSuccess: (data?: any) => void;
  private onError: (data?: any) => void;
  private onCancel: () => void;
  private theme: string;
  private blur: string;
  public modal!: HTMLDivElement;
  public content!: HTMLDivElement;
  public iframe!: HTMLIFrameElement;
  private originalBack!: () => void;
  private originalGo!: (delta?: number) => void;

  constructor(config: ResumeStackConfig) {
    if (!config.accessCode) throw new Error('accessCode is required');

    this.accessCode = config.accessCode;
    this.onSuccess = config.onSuccess || (() => {});
    this.onError = config.onError || (() => {});
    this.onCancel = config.onCancel || (() => {});
    this.theme = detectTheme(config.theme);
    this.blur = config.blur || '0.2rem';

    this.init();
  }

  private init(): void {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = getModalCSS(this.theme, this.blur);
    document.head.appendChild(style);

    // Create modal elements
    this.modal = document.createElement('div');
    this.modal.className = 'resume-stack-modal';

    this.content = document.createElement('div');
    this.content.className = 'resume-stack-content';

    this.iframe = document.createElement('iframe');
    this.iframe.className = 'resume-stack-iframe';
    this.iframe.sandbox = 'allow-same-origin allow-scripts';

    // Override history.back and history.go to close modal instead of navigating
    this.originalBack = window.history.back;
    window.history.back = () => this.close('cancel');
    this.originalGo = window.history.go;
    window.history.go = (delta?: number) => {
      if (delta === -1) {
        this.close('cancel');
      } else {
        this.originalGo.call(window.history, delta);
      }
    };

    this.iframe.src = `${PAYSTACK_CHECKOUT}/${this.accessCode}`;

    this.content.appendChild(this.iframe);
    this.modal.appendChild(this.content);
    document.body.appendChild(this.modal);

    // Handle messages from iframe
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== PAYSTACK_CHECKOUT) return;

      const data = event.data;
      switch (data.event) {
        case 'success':
          this.close('success', data);
          break;
        case 'cancel':
          this.close('cancel');
          break;
        case 'error':
          this.close('error', data);
          break;
        case 'close':
          this.close('cancel');
          break;
      }
    });

    // Show modal
    setTimeout(() => this.modal.classList.add('show'), 10);
  }

  private close(reason: string, data?: any): void {
    // Restore original history methods
    if (this.originalBack) {
      window.history.back = this.originalBack;
    }
    if (this.originalGo) {
      window.history.go = this.originalGo;
    }

    this.modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(this.modal);
    }, 300);

    if (reason === 'success') {
      this.onSuccess(data);
    } else if (reason === 'error') {
      this.onError(data);
    } else {
      this.onCancel();
    }
  }
}

export { ResumeStack };
