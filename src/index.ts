/**
 * ResumeStack - Main entry point for the Paystack transaction resumption library.
 * 
 * @fileoverview
 * This module exports the ResumeStack class and types, and provides global browser
 * compatibility by exposing ResumeStack on the window object for CDN usage.
 * 
 * @example
 * // ES6 Module usage
 * import { ResumeStack } from 'resume-stack';
 * 
 * // CDN usage (via window.ResumeStack)
 * const resumestack = new window.ResumeStack({ accessCode: 'xxx' });
 */

import { ResumeStack } from './resume-stack';

export { ResumeStack } from './resume-stack';
export * from './types';

/**
 * Global type declaration for browser environments.
 * 
 * @description
 * Extends the global Window interface to include the ResumeStack constructor,
 * enabling usage via CDN when the library is loaded in a browser environment.
 * This declaration is ignored in Node.js environments where 'window' is undefined.
 */
declare global {
  interface Window {
    ResumeStack: typeof ResumeStack;
  }
}

/**
 * Global browser compatibility setup.
 * 
 * @description
 * Automatically exposes ResumeStack on the global window object when running
 * in a browser environment. This enables CDN usage without requiring explicit
 * imports. The check ensures this code doesn't run in server-side environments
 * where 'window' is undefined.
 */
if (typeof window !== 'undefined') {
  window.ResumeStack = ResumeStack;
}
