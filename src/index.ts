import { ResumeStack } from './resume-stack';

export { ResumeStack } from './resume-stack';
export * from './types';

// Global instance for easy usage
declare global {
  interface Window {
    ResumeStack: typeof ResumeStack;
  }
}

if (typeof window !== 'undefined') {
  window.ResumeStack = ResumeStack;
}
