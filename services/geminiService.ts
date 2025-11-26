
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WizardResponse, Platform, AppMode, FileContextData, TeamSettingsData } from "../types";

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    responseType: { type: Type.STRING, enum: ['steps', 'analysis', 'answer'] },
    
    // Steps (Used for Generate, Debug, Template, Automate)
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, enum: ['formula', 'create_sheet', 'header', 'format', 'validation', 'insight', 'clean_data'] },
          location: { type: Type.STRING, description: "Target cell (A1), range (A:A), or Sheet name." },
          value: { type: Type.STRING, description: "Content content (formula, header text, color hex)." },
          explanation: { type: Type.STRING, description: "Rationale." }
        },
        required: ["action", "location", "value", "explanation"]
      }
    },

    // Analysis Report
    analysis: {
      type: Type.OBJECT,
      properties: {
        healthScore: { type: Type.INTEGER, description: "0-100 score of sheet quality." },
        summary: { type: Type.STRING, description: "Executive summary of findings." },
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] },
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              suggestion: { type: Type.STRING }
            }
          }
        }
      }
    },

    // Q&A Answer
    qa: {
      type: Type.OBJECT,
      properties: {
        answerText: { type: Type.STRING, description: "Natural language answer to the user's question about data." },
        supportingFormula: { type: Type.STRING, description: "The formula used to derive the answer, if applicable." }
      }
    },

    previewValue: { type: Type.STRING },
    requiresMoreInfo: { type: Type.BOOLEAN },
    errorDebug: { type: Type.STRING }
  },
  required: ["responseType", "requiresMoreInfo"],
};

export const generateOrDebugFormula = async (
  prompt: string, 
  mode: AppMode,
  platform: Platform,
  fileContext: FileContextData | null,
  teamSettings?: TeamSettingsData
): Promise<WizardResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let contextInstruction = `If specific columns aren't provided, use sensible defaults.`;
    
    if (fileContext) {
      const sheetsDesc = fileContext.sheets.map(s => `- ${s.name} (${s.rowCount} rows): [${s.columns.join(', ')}]`).join('\n');
      const sampleDataStr = fileContext.sampleRows.map(row => JSON.stringify(row)).join('\n');
      
      contextInstruction = `
        FILE CONTEXT (Deep Read):
        Filename: "${fileContext.fileName}"
        
        STRUCTURE:
        ${sheetsDesc}
        
        SAMPLE DATA (Active Sheet):
        ${sampleDataStr}
        
        Use this structure to infer relationships between sheets (e.g., IDs matching across tables).
      `;
    }

    const teamInstruction = teamSettings ? `
      TEAM PRESETS (Adhere strictly):
      - Preferred Functions: ${teamSettings.preferredFunctions}
      - Formatting/Style: ${teamSettings.formattingRules}
      - Language: ${teamSettings.language}
    ` : "";

    let modeInstruction = "";
    
    switch (mode) {
      case 'generate':
        modeInstruction = `Task: Generate ${platform} formulas. ResponseType: 'steps'.`;
        break;
      case 'debug':
        modeInstruction = `Task: Fix the broken formula. Explain error in 'errorDebug'. ResponseType: 'steps'.`;
        break;
      case 'template':
        modeInstruction = `Task: Create a full workbook structure. Define sheets ('create_sheet'), headers ('header'), and core formulas. ResponseType: 'steps'.`;
        break;
      case 'analyze':
        modeInstruction = `Task: Act as a Data Auditor. Return an 'analysis' report. If repairs are needed, ALSO include a 'steps' array with repair actions (e.g. 'clean_data', 'formula' fixes). ResponseType: 'analysis'.`;
        break;
      case 'chat':
        modeInstruction = `Task: Answer questions about the data. ResponseType: 'answer'.`;
        break;
      case 'automate':
        modeInstruction = `
          Task: Create a comprehensive EXECUTION PLAN to modify the workbook. 
          Focus on Action Sequencing:
          1. Structure (create_sheet, header)
          2. Cleaning (clean_data)
          3. Logic (formula)
          
          This is a LIVE execution. Be precise with 'location' (e.g. "Sheet1!C2" or "Summary!A1").
          ResponseType: 'steps'.
        `;
        break;
    }

    const systemInstruction = `
      You are an expert ${platform} Automation Architect.
      ${modeInstruction}
      ${platformInstruction(platform)}
      ${contextInstruction}
      ${teamInstruction}
      
      General Rules:
      1. Always start formulas with '='.
      2. For 'automate', assume you are writing to a real file. Be precise.
      3. For 'clean_data', the value should be the cleaned value or instruction.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: mode === 'automate' || mode === 'template' ? 0.3 : 0.2, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as WizardResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      responseType: 'steps',
      steps: [],
      errorDebug: "System Error: Failed to generate response.",
      requiresMoreInfo: true
    };
  }
};

const platformInstruction = (p: Platform) => p === 'Google Sheets' 
  ? `Use Google Sheets functions (FILTER, QUERY, ARRAYFORMULA).` 
  : `Use Excel functions. Prefer newer dynamic array functions (XLOOKUP, FILTER, UNIQUE) if applicable.`;
