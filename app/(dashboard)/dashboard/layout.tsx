// app/dashboard/layout.tsx
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Left Fixed Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center space-x-2 px-2 py-3 mb-6">
            <div className="h-6 w-6 rounded bg-indigo-600" />
            <span className="font-bold text-lg tracking-wider text-white">OPERA AI</span>
          </div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              Operations Console
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              Automation Rules
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              Connected Tenants
            </a>
          </nav>
        </div>
        <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 px-2">
          Workspace: think-visuals
        </div>
      </aside>

      {/* 2. Main Scrollable Panel Frame */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Boundary Bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-white">OS Control Center</h1>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              System Online
            </span>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}