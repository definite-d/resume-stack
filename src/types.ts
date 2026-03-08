export interface ResumeStackConfig {
  accessCode: string;
  onSuccess?: (data?: any) => void;
  onError?: (data?: any) => void;
  onCancel?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  blur?: string;
}