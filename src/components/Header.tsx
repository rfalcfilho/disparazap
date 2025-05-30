import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WhatsAppStatus } from '../types';

interface HeaderProps {
  whatsAppStatus: WhatsAppStatus;
}

const Header: React.FC<HeaderProps> = ({ whatsAppStatus }) => {
  return (
    <header className="border-b border-gray-200 bg-white py-4 px-6 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <MessageSquare className="h-8 w-8 text-[#25D366] mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">DisparaZap</h1>
              <p className="text-sm text-[#666]">Envio de mensagens em massa para WhatsApp</p>
            </div>
          </div>
          
          <div className="h-10 flex items-center">
            <div className="flex items-center">
              <div 
                className={`h-3 w-3 rounded-full mr-2 ${
                  whatsAppStatus.isConnected 
                    ? 'bg-green-500' 
                    : whatsAppStatus.isScanning 
                      ? 'bg-yellow-500 animate-pulse' 
                      : whatsAppStatus.hasError 
                        ? 'bg-red-500' 
                        : 'bg-gray-400'
                }`}
              />
              <span className="text-sm font-medium">
                {whatsAppStatus.isConnected 
                  ? 'Conectado ao WhatsApp' 
                  : whatsAppStatus.isScanning 
                    ? 'Escaneando QR Code...' 
                    : whatsAppStatus.hasError 
                      ? 'Erro de conexão' 
                      : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;