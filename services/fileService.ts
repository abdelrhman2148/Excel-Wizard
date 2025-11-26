
import * as XLSX from 'xlsx';
import { FileContextData, WizardStep, SheetMetadata } from '../types';

export const parseFileContext = async (file: File): Promise<FileContextData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const sheetMetas: SheetMetadata[] = [];
        const sheetNames = workbook.SheetNames;
        
        // Parse all sheets metadata
        sheetNames.forEach(name => {
           const sheet = workbook.Sheets[name];
           const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
           const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
           
           let columns: string[] = [];
           if (rows.length > 0) {
             columns = rows[0].map(h => String(h)).filter(h => h && h.trim() !== '');
           }
           
           sheetMetas.push({
             name,
             columns,
             rowCount: range.e.r + 1
           });
        });

        const mainSheetName = sheetNames[0];
        const mainSheet = workbook.Sheets[mainSheetName];
        const mainRows = XLSX.utils.sheet_to_json<any[]>(mainSheet, { header: 1, defval: "" });
        
        // Sample data: next 5 rows of main sheet
        const sampleRows = mainRows.length > 1 ? mainRows.slice(1, 6) : [];

        resolve({
          fileName: file.name,
          sheets: sheetMetas,
          activeSheetName: mainSheetName,
          sampleRows: sampleRows,
          fullData: mainRows.slice(0, 100)
        });
      } catch (error) {
        console.error("Error parsing file", error);
        reject(new Error("Failed to parse file structure."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file."));

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
  });
};

export const executeWorkflow = async (originalFile: File, steps: WizardStep[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // EXECUTION ENGINE
        steps.forEach(step => {
          try {
            if (step.action === 'create_sheet') {
              const safeName = step.value.replace(/[\\/?*[\]]/g, "").slice(0, 31);
              if (!workbook.Sheets[safeName]) {
                 XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), safeName);
              }
            } else if (['formula', 'header', 'clean_data', 'format'].includes(step.action)) {
              // Parse Location
              let targetSheetName = workbook.SheetNames[0];
              let cellAddress = step.location;

              // Check if location specifies sheet (e.g. "Sheet2!A1")
              if (step.location.includes('!')) {
                const parts = step.location.split('!');
                targetSheetName = parts[0].replace(/'/g, '');
                cellAddress = parts[1];
              }

              const sheet = workbook.Sheets[targetSheetName];
              if (!sheet) return; // Skip if sheet not found

              // Handle Range/Column logic roughly
              // If location is a single cell
              if (cellAddress.match(/^[A-Z]+[0-9]+$/)) {
                 const cellRef = cellAddress;
                 if (step.action === 'formula') {
                    // Write formula
                    // Note: SheetJS Community requires strictly modifying 'v' or 'f'
                    // We need to ensure the cell object exists
                    if (!sheet[cellRef]) sheet[cellRef] = { t: 's', v: '' };
                    sheet[cellRef] = { t: 'n', f: step.value }; 
                 } else if (step.action === 'header' || step.action === 'clean_data') {
                    if (!sheet[cellRef]) sheet[cellRef] = { t: 's', v: '' };
                    sheet[cellRef].v = step.value;
                    delete sheet[cellRef].f; // Clear formula if setting value
                 }
              }
            }
          } catch (err) {
            console.warn(`Failed step: ${step.explanation}`, err);
          }
        });

        // Write and Download
        XLSX.writeFile(workbook, `Automated_${originalFile.name}`);
        resolve();

      } catch (error) {
        reject(error);
      }
    };
    reader.readAsBinaryString(originalFile);
  });
};

export const generateDemoSheet = (
  originalData: any[][], 
  formula: string,
  fileName: string
) => {
  const data = originalData.map(row => [...row]);
  if (data.length === 0) return;

  data[0].push("Wizard Result");
  for (let i = 1; i < data.length; i++) {
    data[i].push(formula); 
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Wizard Demo");
  XLSX.writeFile(wb, `processed_${fileName}`);
};

export const generateTemplateWorkbook = (steps: WizardStep[], title: string) => {
  const wb = XLSX.utils.book_new();
  const sheets: Record<string, any[][]> = {};
  
  sheets["Template"] = [];

  steps.forEach(step => {
    if (step.action === 'create_sheet') {
      sheets[step.value] = [];
    }
  });

  Object.keys(sheets).forEach(sheetName => {
    const wsData: any[][] = [];
    const relevantSteps = steps.filter(s => 
      s.action === 'header' || 
      (s.location && s.location.includes(sheetName)) ||
      (!s.location.includes('!') && sheetName === 'Template')
    );

    const headers = relevantSteps.filter(s => s.action === 'header').map(s => s.value);
    if (headers.length > 0) {
      wsData.push(headers);
    }
    
    // Fallback content
    if (wsData.length === 0) {
      wsData.push(["Instructions"]);
      relevantSteps.forEach(s => wsData.push([s.explanation]));
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_Template.xlsx`);
};
