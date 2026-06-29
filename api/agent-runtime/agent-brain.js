// api/agent-runtime/agent-brain.js
const { GoogleGenAI, Type } = require('@google/genai');
const memoryService = require('./memory-service');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processAgentCycle(businessId, prompt, context = {}) {
  console.log(`[AUDIT LOG] [OPERA OS INTERCEPT] Agent reasoning frame opened for client workspace: ${businessId}`);
  
  // Clean, defensive lazy-loading architecture
  let structuralHistory = [];
  try {
    // Moved INSIDE the operational frame block so the port health check opens instantly on startup
    structuralHistory = await memoryService.getAgentHistory(businessId, 5);
  } catch (memoryError) {
    console.error(`[OPERA OS WARNING] Database memory stream read bypass:`, memoryError.message);
    structuralHistory = [];
  }

  const systemInstruction = `
    You are the central orchestration brain of Opera AI: an AI-native operating system for businesses where agents collaborate to manage day-to-day operations.
    The developers can extend your core workspace through APIs, custom workflows, and custom agents.
    
    Your goal is to parse unstructured text inputs, determine exactly which systems need to collaborate, 
    and break the task down into a structured JSON execution strategy.
    
    Current Connected Workspaces / Active Workspace Tenant: ${businessId}
    Available Core Service Infrastructure Clusters:
    - workflow-engine-api (Handles state machines, long-running processes, notification steps)
    - document-processing-api (Handles data ingestion, OCR extraction from invoices/contracts)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        [OPERATING SYSTEM HISTORICAL EXECUTION LOGS]:
        ${JSON.stringify(structuralHistory)}

        [NEW INCOMING CONTEXT]:
        Parameters: ${JSON.stringify(context)}
        
        [CURRENT BUSINESS OPERATION REQUEST]: 
        "${prompt}"
      `,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoningChain: { type: Type.STRING, description: "The OS step-by-step reasoning plan to solve this task." },
            confidenceScore: { type: Type.NUMBER, description: "Value between 0.0 and 1.0 indicating clarity." },
            primaryCategory: { type: Type.STRING, description: "Operating system routing category." },
            collaboratingAgents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of virtual agents assigned." },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Precise execution triggers." },
            suggestedPayload: { type: Type.OBJECT, description: "Structured metadata extracted." }
          },
          required: ['reasoningChain', 'confidenceScore', 'primaryCategory', 'collaboratingAgents', 'recommendedActions'],
        },
      },
    });

    const actionPlan = JSON.parse(response.text);
    
    // Lock the newly executed cycle data securely into the Firestore Database
    await memoryService.saveAgentExecution(businessId, prompt, actionPlan);
    
    console.log(`[AUDIT LOG] [OPERA OS ROUTING SUCCESS] Action Type: ${actionPlan.primaryCategory}`);
    return actionPlan;
  } catch (error) {
    console.error(`[AUDIT LOG] [OPERA CORE ENGINE EXCEPTION CRASH]:`, error.message);
    throw error;
  }
}

module.exports = { processAgentCycle };