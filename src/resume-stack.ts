/**
 * ResumeStack
 * An alternative to Paystack's InlineJS for modal transaction resumption.
 * Not affiliated with Paystack. Use at your own risk.
 * License: The Unlicense
 */

import { ResumeStackConfig } from "./types";

const PAYSTACK_CHECKOUT = "https://checkout.paystack.com"

/**
 * Detects the appropriate theme based on user preference and system settings.
 * 
 * @param preferred - The preferred theme ('light', 'dark', 'auto', or undefined)
 * @returns The resolved theme ('light' or 'dark')
 * @description
 * - If 'light' or 'dark' is explicitly provided, returns that theme
 * - If 'auto' or undefined, detects system preference using matchMedia
 * - Defaults to 'light' if no preference can be determined
 */
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

/**
 * Generates CSS styles for the modal based on theme and blur settings.
 * 
 * @param theme - The current theme ('light' or 'dark')
 * @param blur - The backdrop blur value (CSS length)
 * @returns Complete CSS string for styling the modal
 * @description
 * Creates responsive CSS that includes:
 * - Modal overlay with backdrop blur
 * - Theme-aware colors and transitions
 * - Mobile-responsive design
 * - Dark mode iframe filters for better visibility
 */
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

/**
 * ResumeStack - A TypeScript library for Paystack transaction resumption.
 * 
 * @class ResumeStack
 * @description
 * Provides a modal interface for resuming Paystack transactions using an access code.
 * Features include theme support, backdrop blur effects, and responsive design.
 * 
 * @example
 * ```typescript
 * const resumestack = new ResumeStack({
 *   accessCode: 'your_access_code',
 *   theme: 'auto',
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 *   onCancel: () => console.log('Cancelled')
 * });
 * ```
 */
class ResumeStack {
  /** Paystack access code for the transaction */
  private accessCode: string;
  /** Callback for successful transactions */
  private onSuccess: (data?: any) => void;
  /** Callback for failed transactions */
  private onError: (data?: any) => void;
  /** Callback for cancelled transactions */
  private onCancel: () => void;
  /** Current theme ('light' or 'dark') */
  private theme: string;
  /** Backdrop blur CSS value */
  private blur: string;
  /** Modal DOM element */
  public modal!: HTMLDivElement;
  /** Content container DOM element */
  public content!: HTMLDivElement;
  /** Iframe DOM element for Paystack checkout */
  public iframe!: HTMLIFrameElement;
  /** Original history.back function reference */
  private originalBack!: () => void;
  /** Original history.go function reference */
  private originalGo!: (delta?: number) => void;

  /**
   * Creates a new ResumeStack instance and displays the modal.
   * 
   * @param config - Configuration object for the ResumeStack instance
   * @throws {Error} If accessCode is not provided in config
   * @description
   * Initializes the modal with the provided configuration and immediately displays it.
   * The constructor handles theme detection, CSS injection, DOM element creation,
   * and sets up event listeners for Paystack iframe messages.
   */
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

  /**
   * Initializes the modal by creating DOM elements and setting up event handlers.
   * 
   * @private
   * @description
   * Performs the following operations:
   * 1. Injects CSS styles into the document head
   * 2. Creates modal, content, and iframe elements
   * 3. Overrides browser history methods to handle modal closing
   * 4. Sets up message listener for Paystack iframe communications
   * 5. Appends elements to DOM and displays the modal
   */
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

    // Override browser history navigation to close modal instead of navigating away
    // This ensures users can use browser back button to close the payment modal
    this.originalBack = window.history.back;
    window.history.back = () => this.close('cancel');
    this.originalGo = window.history.go;
    window.history.go = (delta?: number) => {
      // Only intercept back navigation (delta === -1)
      if (delta === -1) {
        this.close('cancel');
      } else {
        // Allow all other navigation to proceed normally
        this.originalGo.call(window.history, delta);
      }
    };

    // Set iframe source to Paystack checkout with the provided access code
    this.iframe.src = `${PAYSTACK_CHECKOUT}/${this.accessCode}`;

    this.content.appendChild(this.iframe);
    this.modal.appendChild(this.content);
    document.body.appendChild(this.modal);

    // Set up message listener to handle communications from Paystack iframe
    // Only process messages originating from Paystack's checkout domain for security
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== PAYSTACK_CHECKOUT) return;

      const data = event.data;
      // Handle different transaction events from Paystack
      switch (data.event) {
        case 'success':
          // Payment completed successfully
          this.close('success', data);
          break;
        case 'cancel':
          // User cancelled the payment
          this.close('cancel');
          break;
        case 'error':
          // Payment encountered an error
          this.close('error', data);
          break;
        case 'close':
          // Modal was closed (treated as cancellation)
          this.close('cancel');
          break;
      }
    });

    // Show modal with a slight delay to ensure CSS is applied and transition works smoothly
    setTimeout(() => this.modal.classList.add('show'), 10);
  }

  /**
   * Closes the modal and restores the original browser state.
   * 
   * @param reason - The reason for closing ('success', 'error', or 'cancel')
   * @param data - Optional data to pass to the callback (for success/error)
   * @private
   * @description
   * Handles modal cleanup by:
   * 1. Restoring original history.back and history.go methods
   * 2. Removing the modal from DOM with a fade-out animation
   * 3. Triggering the appropriate callback based on the close reason
   */
  private close(reason: string, data?: any): void {
    // Restore original history methods
    if (this.originalBack) {
      window.history.back = this.originalBack;
    }
    if (this.originalGo) {
      window.history.go = this.originalGo;
    }

    this.modal.classList.remove('show');
    // Remove modal from DOM after fade-out animation completes
    setTimeout(() => {
      document.body.removeChild(this.modal);
    }, 300);

    // Trigger appropriate callback based on transaction outcome
    if (reason === 'success') {
      this.onSuccess(data);
    } else if (reason === 'error') {
      this.onError(data);
    } else {
      // Treat any other reason as cancellation
      this.onCancel();
    }
  }
}

export { ResumeStack };
