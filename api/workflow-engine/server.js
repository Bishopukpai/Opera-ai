// api/workflow-engine/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Cloud Run relies on the PORT environment variable to route container traffic
const PORT = process.env.PORT || 8082;

// Base Health check operational endpoint for Workflow Engine
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', service: 'workflow-engine', timestamp: new Date() });
});

// Primary Execution Gateway Endpoint for the Workflow Automation Engine
app.post('/api/v1/trigger-workflow', async (req, res) => {
  const { businessId, workflowId, incidentData } = req.body;
  
  try {
    // Pipeline automation and state machine tracking logic will go here
    console.log(`[WORKFLOW] Triggering state machine loop for tenant: ${businessId}`);
    console.log(`[WORKFLOW] Executing action sequence for workflow: ${workflowId}`);
    
    res.status(200).json({
      success: true,
      message: "Workflow automation pipeline initialized successfully.",
      status: "ACTIVE_PROCESSING",
      details: {
        businessId,
        workflowId,
        executionTimestamp: new Date()
      }
    });
  } catch (error) {
    console.error(`[WORKFLOW ERROR]:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Workflow Engine container active on internal port ${PORT}`);
});