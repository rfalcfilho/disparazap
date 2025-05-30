import { WhatsAppStatus } from "../types";

// Simulated WhatsApp connection
let connectionTimer: ReturnType<typeof setTimeout> | null = null;

export const connectToWhatsApp = (
  setStatus: React.Dispatch<React.SetStateAction<WhatsAppStatus>>,
  onSuccess?: () => void
): void => {
  // Reset any existing timers
  if (connectionTimer) {
    clearTimeout(connectionTimer);
  }

  // Set scanning state
  setStatus({
    isConnected: false,
    isScanning: true,
    hasError: false,
  });

  // Simulate QR code scanning time (5 seconds)
  connectionTimer = setTimeout(() => {
    // 90% chance of successful connection
    const success = Math.random() < 0.9;

    if (success) {
      setStatus({
        isConnected: true,
        isScanning: false,
        hasError: false,
      });
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setStatus({
        isConnected: false,
        isScanning: false,
        hasError: true,
        errorMessage: "Failed to connect to WhatsApp. Please try again.",
      });
    }
  }, 5000);
};

export const disconnectWhatsApp = (
  setStatus: React.Dispatch<React.SetStateAction<WhatsAppStatus>>
): void => {
  // Reset any existing timers
  if (connectionTimer) {
    clearTimeout(connectionTimer);
  }

  // Set disconnected state
  setStatus({
    isConnected: false,
    isScanning: false,
    hasError: false,
  });
};

export const sendMessage = (
  phone: string, 
  message: string
): Promise<{ success: boolean; errorMessage?: string }> => {
  return new Promise((resolve) => {
    // Simulate network delay (0.5-2 seconds)
    const delay = 500 + Math.random() * 1500;
    
    setTimeout(() => {
      // 95% success rate for message sending
      const success = Math.random() < 0.95;
      
      if (success) {
        resolve({ success: true });
      } else {
        resolve({ 
          success: false, 
          errorMessage: "Failed to send message. Recipient might be unavailable."
        });
      }
    }, delay);
  });
};