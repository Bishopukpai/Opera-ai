// api/agent-runtime/firebase-admin.js

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

module.exports = { db };