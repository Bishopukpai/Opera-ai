// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { apiGateway } from '@/lib/api-client';
import { dbService, Incident } from '@/lib/db-service';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  
  const currentBusinessId = "think-visuals"; // Active workspace context

  // 1. Establish the database engine real-time listener hook
  useEffect(() => {
    console.log("Initializing real-time database cluster sync...");
    
    const unsubscribe = dbService.subscribeToIncidents(currentBusinessId, (fetchedIncidents) => {
      setIncidents(fetchedIncidents);
      setIsDataLoading(false);
    });

    // Clean up the pipe listener when the user navigates away from the dashboard
    return () => unsubscribe();
  }, []);

  // 2. Client dispatch trigger to your Cloud Run microservice
  const triggerAIEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Calls your live Cloud Run API
      await apiGateway.executeAgent(currentBusinessId, promptInput);
      setPromptInput('');
    } catch (error) {
      console.error("Failed executing client trigger:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-slate-400">Active Agent Cycles</p>
          <p className="text-3xl font-bold text-rose-500 mt-2">
            {incidents.filter(i => i.status !== 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-slate-400">Autopilot Agent Status</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">Monitoring</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-slate-400">Total Platform Operations</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{incidents.length}</p>
        </div>
      </div>

      {/* AI Command Center Box */}
      <div className="bg-slate-900 border border-indigo-900/40 bg-gradient-to-r from-slate-900 via-indigo-950/10 to-slate-900 p-6 rounded-xl">
        <h3 className="text-sm font-semibold text-indigo-400 tracking-wider uppercase mb-3">AI Agent Command Input</h3>
        <form onSubmit={triggerAIEngine} className="flex gap-4">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Instruct Sentinel Agent (e.g., 'Scan active logs for system anomalies')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isLoading ? 'Thinking...' : 'Dispatch'}
          </button>
        </form>
      </div>

      {/* Live Operations Feed Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-medium text-white">Live Operations Timeline</h2>
        </div>
        
        {isDataLoading ? (
          <div className="p-6 text-center text-sm text-slate-500 animate-pulse">
            Connecting to data pipeline collection...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No active incidents found for this workspace. Use the command box above to dispatch an agent action.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-6 flex items-center justify-between hover:bg-slate-850 transition">
                <div className="flex items-start space-x-4">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${
                    incident.severity === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 
                    incident.severity === 'WARNING' ? 'bg-amber-500' : 'bg-sky-400'
                  }`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-500 font-bold">{incident.id.slice(0,6)}</span>
                      <h4 className="text-sm font-medium text-slate-200">{incident.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {incident.timestamp?.seconds ? new Date(incident.timestamp.seconds * 1000).toLocaleTimeString() : 'Pending'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded border ${
                  incident.status === 'ACTIVE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  incident.status === 'INVESTIGATING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {incident.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}