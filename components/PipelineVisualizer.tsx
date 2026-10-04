import React, { useState } from 'react';
import { Database, Server, Cpu, BarChart2, ArrowRight, Info } from 'lucide-react';
import { getArchitectureExplanation } from '../services/geminiService';

const PipelineVisualizer: React.FC = () => {
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const handleInfoClick = async (title: string) => {
    setLoading(true);
    setModalContent({ title, content: "Loading explanation..." });
    const explanation = await getArchitectureExplanation(title);
    setModalContent({ title, content: explanation });
    setLoading(false);
  };

  const PipelineNode = ({ title, icon: Icon, color, subtext, onClick }: any) => (
    <div 
      className={`relative flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl border-2 ${color} w-48 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group`}
      onClick={() => onClick(title)}
    >
      <div className={`p-3 rounded-full bg-gray-900 mb-3 ${color.replace('border-', 'text-')}`}>
        <Icon size={32} />
      </div>
      <h3 className="font-bold text-sm text-center mb-1">{title}</h3>
      <p className="text-xs text-gray-400 text-center">{subtext}</p>
      <button className="absolute top-2 right-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Info size={16} />
      </button>
    </div>
  );

  return (
    <div className="w-full bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="text-blue-500" />
          Medallion Architecture Pipeline
        </h2>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Live Architecture View</span>
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
                subtext="Real-time Viz" 
                icon={BarChart2} 
                color="border-green-500"
                onClick={handleInfoClick}
            />
        </div>
      </div>

      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-3 text-white">{modalContent.title}</h3>
            <p className="text-gray-300 leading-relaxed min-h-[60px]">
                {modalContent.content}
            </p>
            <button 
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
