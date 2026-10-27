import React, { useState } from 'react';
import { Database, Server, Cpu, BarChart2, ArrowRight, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getArchitectureExplanation } from '../services/geminiService';

interface PipelineNodeProps {
  title: string;
  icon: LucideIcon;
  color: string;
  subtext: string;
  onClick: (title: string) => void;
}

const PipelineNode: React.FC<PipelineNodeProps> = ({ title, icon: Icon, color, subtext, onClick }) => (
  <button
    type="button"
    className={`relative flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl border-2 ${color} w-48 transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 group`}
    onClick={() => onClick(title)}
  >
    <span className={`p-3 rounded-full bg-gray-900 mb-3 ${color.replace('border-', 'text-')}`}>
      <Icon size={32} aria-hidden="true" />
    </span>
    <span className="font-bold text-sm text-center mb-1">{title}</span>
    <span className="text-xs text-gray-400 text-center">{subtext}</span>
    <Info size={16} aria-hidden="true" className="absolute top-2 right-2 text-gray-500 group-hover:text-white" />
  </button>
);

const PipelineVisualizer: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const handleInfoClick = async (title: string) => {
    setModalContent({ title, content: "Loading explanation..." });
    const explanation = await getArchitectureExplanation(title);
    setModalContent({ title, content: explanation });
  };

  return (
    <div className="w-full bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="text-blue-500" />
          Medallion Architecture Pipeline
        </h2>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Reference Architecture</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto pb-4">
        
        {/* Source */}
        <div className="flex flex-col items-center">
             <div className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-widest">Source</div>
             <PipelineNode 
                title="Stock API" 
                subtext="Alpha Vantage / JSON" 
                icon={Server} 
                color="border-purple-500"
                onClick={handleInfoClick} 
            />
        </div>

        <ArrowRight className="text-gray-600 hidden md:block" />

        {/* Bronze */}
        <div className="flex flex-col items-center">
             <div className="text-xs text-orange-400 mb-2 uppercase font-bold tracking-widest">Bronze Layer</div>
             <PipelineNode 
                title="Azure Event Hubs" 
                subtext="Raw Ingestion" 
                icon={Database} 
                color="border-orange-500"
                onClick={handleInfoClick}
            />
        </div>

        <ArrowRight className="text-gray-600 hidden md:block" />

        {/* Silver */}
        <div className="flex flex-col items-center">
             <div className="text-xs text-gray-300 mb-2 uppercase font-bold tracking-widest">Silver Layer</div>
             <PipelineNode 
                title="Databricks / Spark" 
                subtext="Cleaning & Windowing" 
                icon={Cpu} 
                color="border-gray-400"
                onClick={handleInfoClick}
            />
        </div>

        <ArrowRight className="text-gray-600 hidden md:block" />

        {/* Gold */}
        <div className="flex flex-col items-center">
             <div className="text-xs text-yellow-400 mb-2 uppercase font-bold tracking-widest">Gold Layer</div>
             <PipelineNode 
                title="Delta Lake" 
                subtext="Aggregated Insights" 
                icon={Database} 
                color="border-yellow-500"
                onClick={handleInfoClick}
            />
        </div>

        <ArrowRight className="text-gray-600 hidden md:block" />

        {/* Consumption */}
        <div className="flex flex-col items-center">
             <div className="text-xs text-green-400 mb-2 uppercase font-bold tracking-widest">Consumption</div>
             <PipelineNode 
                title="React Dashboard" 
                subtext="Simulated Visualization" 
                icon={BarChart2} 
                color="border-green-500"
                onClick={handleInfoClick}
            />
        </div>
      </div>

      {modalContent && (
        <div role="dialog" aria-modal="true" aria-labelledby="pipeline-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 id="pipeline-dialog-title" className="text-xl font-bold mb-3 text-white">{modalContent.title}</h3>
            <p className="text-gray-300 leading-relaxed min-h-[60px]">
                {modalContent.content}
            </p>
            <button 
              type="button"
              onClick={() => setModalContent(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineVisualizer;
