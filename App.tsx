import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Code2, TerminalSquare, Github, Linkedin, Cloud, Server } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PipelineVisualizer from './components/PipelineVisualizer';
import CodeShowcase from './components/CodeShowcase';
import { LogEntry } from './types';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'code'>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (log: LogEntry) => {
    setLogs(prev => {
        const newLogs = [...prev, log];
        if (newLogs.length > 50) return newLogs.slice(-50);
        return newLogs;
    });
  };

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between shrink-0 transition-all duration-300">
        <div>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800">
              <Cloud className="text-blue-500 shrink-0" size={28} />
              <span className="ml-3 font-bold text-lg hidden lg:block tracking-tight text-white">Azure<span className="text-blue-500">Stream</span></span>
            </div>

            <nav className="p-4 space-y-2">
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center p-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
              >
                <LayoutDashboard size={20} />
                <span className="ml-3 font-medium hidden lg:block">Pipeline View</span>
              </button>
              
              <button 
                onClick={() => setActiveView('code')}
                className={`w-full flex items-center p-3 rounded-xl transition-all ${activeView === 'code' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
              >
                <Code2 size={20} />
                <span className="ml-3 font-medium hidden lg:block">Implementation</span>
              </button>
            </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-900 rounded-xl p-4 hidden lg:block border border-gray-800">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">System Status</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Event Hubs: Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-300">Databricks: Active</span>
                </div>
            </div>
            <div className="mt-4 flex justify-center gap-4 lg:justify-start text-gray-500">
                 <Github size={20} className="hover:text-white cursor-pointer"/>
                 <Linkedin size={20} className="hover:text-white cursor-pointer"/>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-white">
            {activeView === 'dashboard' ? 'Real-Time Stock Analytics' : 'Infrastructure as Code'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-mono">
                Running: PROD-US-EAST
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col h-full gap-8">
                
                {activeView === 'dashboard' && (
                    <>
                        <PipelineVisualizer />
                        <div className="flex-1 min-h-[500px]">
                            <Dashboard onLog={addLog} />
                        </div>
                    </>
                )}

                {activeView === 'code' && (
                    <div className="h-full min-h-[600px]">
                        <CodeShowcase />
                    </div>
                )}
            </div>
        </div>
        
        {/* Logs Drawer (Always visible at bottom or collapsible) */}
        <div className="h-48 bg-gray-950 border-t border-gray-800 flex flex-col shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
                <TerminalSquare size={16} className="text-gray-400"/>
                <span className="text-xs font-mono text-gray-400 uppercase">System Logs (Live Stream)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                {logs.length === 0 && <span className="text-gray-600 italic">Waiting for stream to start...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-4">
                        <span className="text-gray-500 w-20 shrink-0">{log.timestamp}</span>
                        <span className={`w-32 shrink-0 ${
                            log.stage === 'Ingestion (Bronze)' ? 'text-orange-400' : 
                            log.stage === 'Processing (Silver)' ? 'text-blue-400' : 'text-yellow-400'
                        }`}>[{log.stage}]</span>
                        <span className="text-gray-300">{log.message}</span>
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;
