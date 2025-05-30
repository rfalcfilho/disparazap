import { FileData } from "../types";

export const parseExcelFile = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    // This is a mock implementation since we can't use actual Excel parsing libraries
    // In a real implementation, you would use a library like xlsx or exceljs
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock successful parse
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        // Generate mock data
        const mockColumns = ['name', 'phone', 'email', 'company'];
        const mockData = [];
        
        // Generate 10 mock entries
        for (let i = 0; i < 10; i++) {
          mockData.push({
            name: `Contact ${i + 1}`,
            phone: `+55${Math.floor(10000000000 + Math.random() * 90000000000)}`,
            email: `contact${i + 1}@example.com`,
            company: `Company ${String.fromCharCode(65 + i % 26)}`,
          });
        }
        
        resolve({
          fileName: file.name,
          columns: mockColumns,
          data: mockData,
        });
      } else {
        reject(new Error("Unsupported file format. Please upload an Excel or CSV file."));
      }
    }, 1000);
  });
};

export const processTemplate = (template: string, data: Record<string, string>): string => {
  // Replace all variables in the format {variableName} with their values
  return template.replace(/{([^}]+)}/g, (match, variable) => {
    return data[variable.trim()] || match;
  });
};