import React, { useState, useRef } from 'react';
import { Upload, Clock, AlignLeft } from 'lucide-react';
import { FileData } from '../types';
import { parseExcelFile } from '../utils/file-processing';

interface ConfigurationPanelProps {
  isWhatsAppConnected: boolean;
  onFileDataLoaded: (fileData: FileData) => void;
  onConfigSubmit: (config: {
    phoneColumn: string;
    messageTemplate: string;
    intervalSeconds: number;
  }) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  isWhatsAppConnected,
  onFileDataLoaded,
  onConfigSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [phoneColumn, setPhoneColumn] = useState<string>('');
  const [messageTemplate, setMessageTemplate] = useState<string>('');
  const [intervalSeconds, setIntervalSeconds] = useState<number>(10);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileChange = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseExcelFile(file);
      setFileData(data);
      onFileDataLoaded(data);
      
      // Auto-select phone column if one exists with common names
      const phoneColumnNames = ['phone', 'telefone', 'celular', 'whatsapp', 'mobile'];
      const foundPhoneColumn = data.columns.find(column => 
        phoneColumnNames.some(name => column.toLowerCase().includes(name))
      );
      
      if (foundPhoneColumn) {
        setPhoneColumn(foundPhoneColumn);
      } else if (data.columns.length > 0) {
        setPhoneColumn(data.columns[0]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneColumn) {
      setError('Selecione a coluna que contém os números de telefone');
      return;
    }
    
    if (!messageTemplate.trim()) {
      setError('Digite uma mensagem para enviar');
      return;
    }
    
    onConfigSubmit({
      phoneColumn,
      messageTemplate,
      intervalSeconds,
    });
  };

  // Insert variable into message template
  const insertVariable = (variable: string) => {
    setMessageTemplate(prev => `${prev}{${variable}} `);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Configurar Envio</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivo de Contatos (Excel/CSV)
          </label>
          
          <div
            ref={dropAreaRef}
            className={`
              border-2 border-dashed border-gray-300 rounded-lg p-6
              bg-gray-50 text-center cursor-pointer
              transition-colors duration-200
              ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              disabled={isLoading || !isWhatsAppConnected}
            />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Processando arquivo...</p>
              </div>
            ) : fileData ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">{fileData.fileName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {fileData.data.length} contatos carregados
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileData(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Trocar arquivo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">Arraste seu arquivo aqui ou clique para selecionar</p>
                <p className="text-xs text-gray-500 mt-1">
                  Suporta arquivos Excel (.xlsx, .xls) e CSV
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Column Selection */}
        {fileData && (
          <div className="mb-6">
            <label htmlFor="phoneColumn" className="block text-sm font-medium text-gray-700 mb-2">
              Coluna com Números de Telefone
            </label>
            <div className="relative">
              <select
                id="phoneColumn"
                value={phoneColumn}
                onChange={(e) => setPhoneColumn(e.target.value)}
                className="block w-full h-12 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                disabled={!fileData}
                required
              >
                <option value="" disabled>Selecione a coluna</option>
                {fileData.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {fileData.columns.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Inserir variáveis na mensagem:</p>
                <div className="flex flex-wrap gap-1">
                  {fileData.columns.map((column) => (
                    <button
                      key={column}
                      type="button"
                      onClick={() => insertVariable(column)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      {`{${column}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Message Template */}
        <div className="mb-6">
          <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <AlignLeft className="w-4 h-4 mr-1" />
            Mensagem
          </label>
          <textarea
            id="messageTemplate"
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            placeholder="Digite sua mensagem aqui. Use {variavel} para inserir dados do contato."
            disabled={!isWhatsAppConnected}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Exemplo: Olá {'{nome}'}, como vai? Estamos com uma promoção especial para a {'{empresa}'}.
          </p>
        </div>
        
        {/* Interval Setting */}
        <div className="mb-6">
          <label htmlFor="intervalSeconds" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Intervalo entre mensagens (segundos)
          </label>
          <div className="flex items-center">
            <button
              type="button"
              className="w-10 h-12 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-l-md hover:bg-gray-200"
              onClick={() => setIntervalSeconds(prev => Math.max(1, prev - 1))}
              disabled={!isWhatsAppConnected}
            >
              -
            </button>
            <input
              id="intervalSeconds"
              type="number"
              min="1"
              max="60"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 10)}
              className="block w-full h-12 px-3 py-2 border-t border-b border-gray-300 text-center"
              disabled={!isWhatsAppConnected}
            />
            <button
              type="button"
              className="w-10 h-12 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200"
              onClick={() => setIntervalSeconds(prev => Math.min(60, prev + 1))}
              disabled={!isWhatsAppConnected}
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Recomendamos pelo menos 10 segundos para evitar bloqueios do WhatsApp.
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`
            w-full sm:w-auto px-8 py-3 bg-[#25D366] text-white font-medium rounded-md
            hover:bg-[#128C7E] transition-colors duration-200
            flex items-center justify-center
            ${(!isWhatsAppConnected || !fileData) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={!isWhatsAppConnected || !fileData}
        >
          Iniciar Envio de Mensagens
        </button>
      </form>
    </div>
  );
};

export default ConfigurationPanel;