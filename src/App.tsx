import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Header from './components/Header';
import QRCodeScanner from './components/QRCodeScanner';
import ConfigurationPanel from './components/ConfigurationPanel';
import ProgressMonitor from './components/ProgressMonitor';

import { Contact, WhatsAppStatus, FileData } from './types';
import { connectToWhatsApp, disconnectWhatsApp, sendMessage } from './utils/whatsapp';
import { processTemplate } from './utils/file-processing';

function App() {
  // WhatsApp connection state
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>({
    isConnected: false,
    isScanning: false,
    hasError: false,
  });

  // Data state
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(-1);
  const [configuration, setConfiguration] = useState<{
    phoneColumn: string;
    messageTemplate: string;
    intervalSeconds: number;
  } | null>(null);

  // Handle connection request
  const handleConnect = () => {
    connectToWhatsApp(setWhatsAppStatus);
  };

  // Handle file data loaded
  const handleFileDataLoaded = (data: FileData) => {
    setFileData(data);
    
    // Create contact list from file data
    const newContacts = data.data.map(row => ({
      id: uuidv4(),
      name: row.name || row[Object.keys(row)[0]] || 'Unknown',
      phone: row.phone || row[Object.keys(row)[0]] || '',
      status: 'pending' as const,
    }));
    
    setContacts(newContacts);
  };

  // Handle configuration submit
  const handleConfigSubmit = (config: {
    phoneColumn: string;
    messageTemplate: string;
    intervalSeconds: number;
  }) => {
    setConfiguration(config);
    
    // Update contact list with correct phone numbers
    if (fileData) {
      const updatedContacts = fileData.data.map((row, index) => ({
        id: contacts[index]?.id || uuidv4(),
        name: row.name || row[Object.keys(row)[0]] || 'Unknown',
        phone: row[config.phoneColumn] || '',
        status: 'pending' as const,
      }));
      
      setContacts(updatedContacts);
      startProcessing(updatedContacts, config);
    }
  };

  // Start sending messages
  const startProcessing = (contactList: Contact[], config: {
    phoneColumn: string;
    messageTemplate: string;
    intervalSeconds: number;
  }) => {
    setIsProcessing(true);
    setCurrentContactIndex(0);
  };

  // Cancel sending
  const handleCancel = () => {
    setIsProcessing(false);
    setCurrentContactIndex(-1);
  };

  // Process messages queue
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const processQueue = async () => {
      if (isProcessing && configuration && fileData && currentContactIndex >= 0 && currentContactIndex < contacts.length) {
        const contact = contacts[currentContactIndex];
        const contactData = fileData.data[currentContactIndex];
        
        if (contact.status === 'pending') {
          // Process message template with contact data
          const message = processTemplate(configuration.messageTemplate, contactData);
          
          try {
            const result = await sendMessage(contact.phone, message);
            
            // Update contact status
            const updatedContacts = [...contacts];
            updatedContacts[currentContactIndex] = {
              ...contact,
              status: result.success ? 'sent' : 'failed',
              errorMessage: result.errorMessage,
            };
            setContacts(updatedContacts);
            
          } catch (error) {
            // Handle error
            const updatedContacts = [...contacts];
            updatedContacts[currentContactIndex] = {
              ...contact,
              status: 'failed',
              errorMessage: 'Erro ao enviar mensagem',
            };
            setContacts(updatedContacts);
          }
        }
        
        // Move to next contact after interval
        timeoutId = setTimeout(() => {
          if (currentContactIndex < contacts.length - 1) {
            setCurrentContactIndex(currentContactIndex + 1);
          } else {
            setIsProcessing(false);
            setCurrentContactIndex(-1);
          }
        }, configuration.intervalSeconds * 1000);
      }
    };
    
    processQueue();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isProcessing, currentContactIndex, contacts, configuration, fileData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectWhatsApp(setWhatsAppStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header whatsAppStatus={whatsAppStatus} />
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <QRCodeScanner
              status={whatsAppStatus}
              onConnect={handleConnect}
            />
          </div>
          
          <div>
            <ConfigurationPanel
              isWhatsAppConnected={whatsAppStatus.isConnected}
              onFileDataLoaded={handleFileDataLoaded}
              onConfigSubmit={handleConfigSubmit}
            />
          </div>
        </div>
        
        {contacts.length > 0 && (
          <div className="mt-8">
            <ProgressMonitor
              contacts={contacts}
              isProcessing={isProcessing}
              currentIndex={currentContactIndex}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>DisparaZap © {new Date().getFullYear()} - Envio em massa para WhatsApp</p>
        </div>
      </footer>
    </div>
  );
}

export default App;