/**
 * Configuration object for ResumeStack initialization.
 * 
 * @interface ResumeStackConfig
 * @description Defines the configuration options for creating a ResumeStack modal instance.
 * All properties except accessCode are optional and provide callbacks and styling options.
 */
export interface ResumeStackConfig {
  /**
   * The Paystack access code for the transaction to be resumed.
   * This is a required parameter and must be a valid Paystack access code.
   */
  accessCode: string;

  /**
   * Callback function triggered when the transaction is completed successfully.
   * Receives transaction data from Paystack as an optional parameter.
   * 
   * @param data - Optional transaction data returned by Paystack
   * @example
   * onSuccess: (data) => {
   *   console.log('Payment successful:', data);
   *   // Redirect to success page
   *   window.location.href = '/success';
   * }
   */
  onSuccess?: (data?: any) => void;

  /**
   * Callback function triggered when the transaction encounters an error.
   * Receives error data from Paystack as an optional parameter.
   * 
   * @param data - Optional error data returned by Paystack
   * @example
   * onError: (error) => {
   *   console.error('Payment failed:', error);
   *   // Show error message to user
   *   alert('Payment failed. Please try again.');
   * }
   */
  onError?: (data?: any) => void;

  /**
   * Callback function triggered when the user cancels the transaction.
   * This is called when the user closes the modal or cancels the payment.
   * 
   * @example
   * onCancel: () => {
   *   console.log('Payment cancelled by user');
   *   // Redirect back to checkout page
   *   window.location.href = '/checkout';
   * }
   */
  onCancel?: () => void;

  /**
   * Theme preference for the modal interface.
   * Controls the appearance of the modal overlay and close button.
   * 
   * @default 'auto'
   * @example
   * theme: 'dark'  // Force dark mode
   * theme: 'light' // Force light mode
   * theme: 'auto'  // Auto-detect based on system preference
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * CSS backdrop blur value for the modal overlay.
   * Creates a blur effect behind the modal to focus attention on the payment interface.
   * 
   * @default '0.2rem'
   * @example
   * blur: '0.5rem'  // More blur
   * blur: '0'       // No blur
   * blur: '1rem'    // Maximum blur
   */
  blur?: string;
}