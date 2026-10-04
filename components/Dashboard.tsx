import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Play, Pause, TrendingUp, BrainCircuit, ChevronDown } from 'lucide-react';
import { StockDataPoint, LogEntry, PipelineStage } from '../types';
import { getMarketAnalysis } from '../services/geminiService';

interface DashboardProps {
  onLog: (log: LogEntry) => void;
}

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', basePrice: 150.00, volatility: 1.2 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ', basePrice: 420.00, volatility: 1.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ', basePrice: 880.00, volatility: 8.5 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ', basePrice: 180.00, volatility: 2.0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ', basePrice: 175.00, volatility: 4.5 },
  { symbol: 'BTC', name: 'Bitcoin USD', market: 'CRYPTO', basePrice: 65000.00, volatility: 150.0 },
];

const Dashboard: React.FC<DashboardProps> = ({ onLog }) => {
  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [price, setPrice] = useState(selectedStock.basePrice);
  const [analysis, setAnalysis] = useState<string>("Waiting for data stream to generate insights...");
  const [analyzing, setAnalyzing] = useState(false);
  
  // Simulation Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataRef = useRef<StockDataPoint[]>([]); // Ref to access latest data in closures

  // Initial Data Generation & Reset when stock changes
  useEffect(() => {
    const initialData: StockDataPoint[] = [];
    let currentPrice = selectedStock.basePrice;
    const now = new Date();
    for (let i = 20; i > 0; i--) {
        const time = new Date(now.getTime() - i * 5000); // 5 sec intervals
        const change = (Math.random() - 0.5) * selectedStock.volatility;
        currentPrice += change;
        initialData.push({
            timestamp: time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' }),
            price: Number(currentPrice.toFixed(2)),
            ma5: Number((currentPrice - Math.random()).toFixed(2)),
            rsi: 40 + Math.random() * 20,
            volume: Math.floor(Math.random() * 1000)
        });
    }
    setData(initialData);
    dataRef.current = initialData;
    setPrice(currentPrice);
    setAnalysis(`Ready to analyze ${selectedStock.symbol}...`);
  }, [selectedStock]);

  // Simulation Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setPrice((prevPrice) => {
          const volatility = selectedStock.volatility;
          const change = (Math.random() - 0.5) * volatility;
          const newPrice = Number((prevPrice + change).toFixed(2));
          
          const now = new Date();
          const timestamp = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });

          const newPoint: StockDataPoint = {
            timestamp,
            price: newPrice,
            ma5: Number((newPrice + (Math.random() - 0.5)).toFixed(2)),
            rsi: Math.max(0, Math.min(100, 50 + (change * 10))), // Simple heuristic
            volume: Math.floor(Math.random() * 1000 + 500)
          };

          setData(prev => {
            const newData = [...prev.slice(-40), newPoint]; // Keep last 40 points
            dataRef.current = newData;
            return newData;
          });

          // Simulate Pipeline Logs
          onLog({
            id: Date.now().toString() + '1',
            timestamp,
            stage: PipelineStage.INGESTION,
            message: `Event Hub received ${selectedStock.symbol} tick: $${newPrice}`,
            type: 'info'
          });
          
          if (Math.random() > 0.7) {
             onLog({
                id: Date.now().toString() + '2',
                timestamp,
                stage: PipelineStage.PROCESSING,
                message: `Spark Window Triggered: 5m MA Updated`,
                type: 'success'
              });
          }

          return newPrice;
        });
      }, 1500); // Update every 1.5 seconds
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onLog, selectedStock]);

  const handleAnalysis = async () => {
    if (dataRef.current.length === 0) return;
    setAnalyzing(true);
    const result = await getMarketAnalysis(dataRef.current, selectedStock.symbol);
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
        {/* Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 relative z-20">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-bold">Current Asset</span>
                    
                    {/* Stock Selector Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                            {selectedStock.symbol} <ChevronDown size={20} />
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block ring-1 ring-black ring-opacity-5">
                            {STOCKS.map((s) => (
                                <button
                                    key={s.symbol}
                                    onClick={() => setSelectedStock(s)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex flex-col border-b border-gray-700 last:border-0 ${selectedStock.symbol === s.symbol ? 'bg-gray-700/50' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white">{s.symbol}</span>
                                        <span className="text-xs font-mono text-gray-400">${s.basePrice.toLocaleString()}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <span className="text-sm bg-gray-700 px-2 py-0.5 rounded text-gray-300 w-fit mt-1">{selectedStock.market}</span>
                </div>
                <div className="h-10 w-px bg-gray-700 mx-2"></div>
                <div className="flex flex-col">
                     <span className="text-xs text-gray-400 uppercase font-bold">Last Price</span>
                     <span className={`text-2xl font-mono font-bold ${data.length > 1 && data[data.length-1].price > data[data.length-2].price ? 'text-green-400' : 'text-red-400'}`}>
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                        isRunning 
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50' 
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                    }`}
                >
                    {isRunning ? <><Pause size={18}/> Pause Stream</> : <><Play size={18}/> Start Stream</>}
                </button>
                <button 
                    onClick={handleAnalysis}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <BrainCircuit size={18}/>
                    {analyzing ? "Analyzing..." : "AI Insight"}
                </button>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Main Price Chart */}
            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-xl flex flex-col relative z-10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" size={20}/>
                    Real-Time Price Action (Silver Layer)
                </h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="timestamp" 
                                stroke="#9ca3af" 
                                tick={{fontSize: 12}}
                                tickMargin={10}
                            />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                stroke="#9ca3af"
                                tick={{fontSize: 12}}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                itemStyle={{ color: '#e5e7eb' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                isAnimationActive={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="ma5" 
                                stroke="#f59e0b" 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Analysis & Indicators */}
            <div className="flex flex-col gap-6 relative z-10">
                {/* AI Box */}
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-xl flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                        <BrainCircuit className="text-indigo-400" size={20}/>
                        Analyst Insights
                    </h3>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex-1 overflow-y-auto">
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                            "{analysis}"
                        </p>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-xl h-48 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Relative Strength Index (RSI)</h3>
                    <div className="flex-1 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                    formatter={(val: number) => val.toFixed(1)}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="rsi" 
                                    stroke="#ec4899" 
                                    strokeWidth={2} 
                                    dot={false}
                                    isAnimationActive={false} 
                                />
                                {/* Reference Lines for Overbought/Oversold */}
                                <Line dataKey={() => 70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                                <Line dataKey={() => 30} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;