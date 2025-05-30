import React, { useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { WhatsAppStatus } from '../types';

interface QRCodeScannerProps {
  status: WhatsAppStatus;
  onConnect: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ status, onConnect }) => {
  // Mock QR code - in a real app, this would be generated from WhatsApp Web API
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WhatsAppConnection123456";
  
  // Effect to simulate QR code expiration and regeneration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (!status.isConnected && !status.hasError) {
      interval = setInterval(() => {
        // This would trigger a new QR code fetch in a real implementation
      }, 20000); // QR codes typically expire after 20 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Conecte ao WhatsApp</h2>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
        Abra o WhatsApp no seu telefone, toque em Menu ou Configurações e selecione WhatsApp Web. 
        Aponte seu telefone para esta tela para capturar o código.
      </p>
      
      <div 
        className={`
          w-[300px] h-[300px] 
          flex items-center justify-center 
          border-2 rounded-lg 
          ${status.isConnected 
            ? 'border-green-500 bg-green-50' 
            : status.isScanning 
              ? 'border-yellow-500 bg-yellow-50 animate-pulse' 
              : status.hasError 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 border-dashed bg-gray-50'
          }
          transition-all duration-300
        `}
      >
        {status.isConnected ? (
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-full p-4 inline-flex mb-4">
              <QrCode size={48} />
            </div>
            <p className="text-green-700 font-medium">Conectado com sucesso!</p>
          </div>
        ) : status.hasError ? (
          <div className="text-center p-4">
            <p className="text-red-600 font-medium mb-2">Erro de conexão</p>
            <p className="text-sm text-gray-600 mb-4">{status.errorMessage}</p>
            <button 
              onClick={onConnect}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {status.isScanning ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm font-medium">Escaneando...</p>
                </div>
              </div>
            ) : null}
            <img 
              src={qrCodeUrl} 
              alt="QR Code para conexão com WhatsApp" 
              className="w-[250px] h-[250px]"
              style={{ opacity: status.isScanning ? 0.5 : 1 }}
            />
          </>
        )}
      </div>
      
      {!status.isConnected && !status.isScanning && !status.hasError && (
        <button 
          onClick={onConnect}
          className="mt-6 px-6 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium rounded-md transition-colors duration-200"
          aria-label="Conectar ao WhatsApp"
        >
          Conectar ao WhatsApp
        </button>
      )}
      
      {status.isConnected && (
        <p className="mt-4 text-sm text-green-700">
          Você está conectado ao WhatsApp e pronto para enviar mensagens!
        </p>
      )}
    </div>
  );
};

export default QRCodeScanner;