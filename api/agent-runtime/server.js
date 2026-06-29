// api/agent-runtime/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { processAgentCycle } = require('./agent-brain');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', service: 'agent-runtime', timestamp: new Date() });
});

// Primary Execution Gateway Endpoint for the AI Orchestrator
app.post('/api/v1/execute-agent', async (req, res) => {
  const { businessId, prompt, context } = req.body;
  
  if (!businessId || !prompt) {
    return res.status(400).json({ error: "Missing required properties: businessId and prompt." });
  }
  
  try {
    // Pass execution payload through the Gemini reasoning loop
    const decisionPlan = await processAgentCycle(businessId, prompt, context);
    
    res.status(200).json({
      success: true,
      message: "Agent operational cycle completed.",
      output: decisionPlan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Agent Runtime container active on internal port ${PORT}`);
});