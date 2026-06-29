// api/agent-runtime/memory-service.js

const { db } = require("./firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

const memoryService = {
  /**
   * Retrieve historical execution memory to feed agent context arrays.
   */
  async getAgentHistory(businessId, limit = 5) {
    try {
      console.log(
        `[MEMORY READ] Pulling OS history logs for tenant: ${businessId}`
      );

      const snapshot = await db
        .collection("agent_memory")
        .where("businessId", "==", businessId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      const history = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        history.push({
          prompt: data.prompt,
          category: data.executionPlan?.primaryCategory,
          actions: data.executionPlan?.recommendedActions,
        });
      });

      // Return oldest → newest
      return history.reverse();
    } catch (error) {
      console.error(
        "[MEMORY ERROR] Could not read memory tracking logs:",
        error
      );

      return [];
    }
  },

  /**
   * Save a completed execution plan to Firestore.
   */
  async saveAgentExecution(businessId, prompt, executionPlan) {
    try {
      const payload = {
        businessId,
        prompt,
        executionPlan,
        timestamp: FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("agent_memory").add(payload);

      console.log(
        `[MEMORY WRITE] Saved execution sequence state to document: ${docRef.id}`
      );

      return docRef.id;
    } catch (error) {
      console.error(
        "[MEMORY ERROR] Failed writing execution chain to Firestore:",
        error
      );

      throw error;
    }
  },
};

module.exports = memoryService;