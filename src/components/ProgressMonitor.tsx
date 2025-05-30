import React, { useEffect, useRef } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Contact } from '../types';

interface ProgressMonitorProps {
  contacts: Contact[];
  isProcessing: boolean;
  currentIndex: number;
  onCancel: () => void;
}

const ProgressMonitor: React.FC<ProgressMonitorProps> = ({
  contacts,
  isProcessing,
  currentIndex,
  onCancel,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current contact
  useEffect(() => {
    if (isProcessing && tableRef.current && currentIndex >= 0) {
      const tableRows = tableRef.current.querySelectorAll('tr');
      if (tableRows[currentIndex]) {
        tableRows[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentIndex, isProcessing]);

  // Calculate progress percentage
  const progressPercentage = contacts.length > 0
    ? Math.round((contacts.filter(c => c.status !== 'pending').length / contacts.length) * 100)
    : 0;

  if (!contacts.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Progresso do Envio</h2>
        
        {isProcessing && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Cancelar Envio
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-[#25D366] h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm mb-6">
        <div>
          <span className="font-medium">{contacts.filter(c => c.status !== 'pending').length}</span> de <span className="font-medium">{contacts.length}</span> mensagens enviadas
        </div>
        <div className="font-medium">{progressPercentage}%</div>
      </div>
      
      {/* Contacts table */}
      <div className="overflow-auto max-h-[400px] border border-gray-200 rounded-lg" ref={tableRef}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact, index) => (
              <tr 
                key={contact.id} 
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  ${currentIndex === index && isProcessing ? 'bg-blue-50' : ''}
                  transition-colors duration-300
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contact.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {contact.status === 'sent' ? (
                      <>
                        <span className="flex items-center text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <Check className="w-3 h-3 mr-1" />
                          Enviado
                        </span>
                      </>
                    ) : contact.status === 'failed' ? (
                      <>
                        <span className="flex items-center text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <X className="w-3 h-3 mr-1" />
                          Falhou
                        </span>
                        {contact.errorMessage && (
                          <span className="ml-2 text-xs text-gray-500" title={contact.errorMessage}>
                            {contact.errorMessage.length > 20 
                              ? contact.errorMessage.substring(0, 20) + '...' 
                              : contact.errorMessage}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!isProcessing && progressPercentage === 100 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md text-green-800">
          <p className="font-medium">Envio concluído com sucesso!</p>
          <p className="text-sm mt-1">
            Todas as mensagens foram processadas. 
            {contacts.filter(c => c.status === 'failed').length > 0 && 
              ` ${contacts.filter(c => c.status === 'failed').length} mensagens falharam e podem ser reenviadas.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressMonitor;