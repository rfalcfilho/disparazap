export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  isScanning: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface FileData {
  fileName: string;
  columns: string[];
  data: Record<string, string>[];
}