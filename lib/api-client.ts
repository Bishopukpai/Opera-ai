// lib/api-client.ts

const AGENT_RUNTIME_URL = process.env.NEXT_PUBLIC_AGENT_RUNTIME_URL;
const WORKFLOW_ENGINE_URL = process.env.NEXT_PUBLIC_WORKFLOW_ENGINE_URL;
const DOC_PROCESSING_URL = process.env.NEXT_PUBLIC_DOC_PROCESSING_URL;

export const apiGateway = {
  /**
   * 1. Agent Runtime Gateway Connection
   */
  executeAgent: async (businessId: string, prompt: string, context?: any) => {
    try {
      const response = await fetch(`${AGENT_RUNTIME_URL}/api/v1/execute-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, prompt, context }),
      });
      return await response.json();
    } catch (error) {
      console.error("Agent Runtime Handshake Error:", error);
      throw error;
    }
  },

  /**
   * 2. Workflow Engine Gateway Connection
   */
  triggerWorkflow: async (businessId: string, workflowId: string, incidentData: any) => {
    try {
      const response = await fetch(`${WORKFLOW_ENGINE_URL}/api/v1/trigger-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, workflowId, incidentData }),
      });
      return await response.json();
    } catch (error) {
      console.error("Workflow Engine Handshake Error:", error);
      throw error;
    }
  },

  /**
   * 3. Document Processing Gateway Connection
   */
  processDocument: async (businessId: string, documentUrl: string, fileType: string) => {
    try {
      const response = await fetch(`${DOC_PROCESSING_URL}/api/v1/process-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, documentUrl, fileType }),
      });
      return await response.json();
    } catch (error) {
      console.error("Document Processing Handshake Error:", error);
      throw error;
    }
  }
};