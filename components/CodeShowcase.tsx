import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { CodeSnippet } from '../types';

const SNIPPETS: CodeSnippet[] = [
  {
    title: '.NET 8 Real-Time Stock Producer',
    language: 'csharp',
    description: 'HttpClient + Rx.NET streaming with synthetic fallback to maintain 100+ msg/sec into Azure Event Hubs.',
    code: `var tickStream = Observable.Interval(TimeSpan.FromMilliseconds(1000d / settings.TargetMessagesPerSecond), TaskPoolScheduler.Default)
    .SelectMany(_ => Observable.FromAsync(ct => FetchStockTickAsync(settings, httpClient, logger, ct)))
    .Where(tick => tick is not null)
    .Select(tick => tick!)
    .Publish()
    .RefCount();

tickStream
    .Buffer(TimeSpan.FromMilliseconds(100), 50)
    .Where(batch => batch.Count > 0)
    .SelectMany(batch => Observable.FromAsync(ct => SendBatchAsync(eventHubProducer, batch, logger, ct)))
    .Subscribe();

public sealed class StockTick
{
    public required string Symbol { get; init; }
    public required decimal Price { get; init; }
    public required long Volume { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
}`
  },
  {
    title: 'Databricks Silver Layer (PySpark)',
    language: 'python',
    description: 'Structured Streaming sliding window metrics (RSI + volatility) with watermarking and Delta append writes.',
    code: `parsed_ticks = raw_stream
    .select(from_json(col("body").cast("string"), stock_schema).alias("tick"))
    .select("tick.*")
    .withWatermark("timestamp", "10 minutes")

windowed_stats = parsed_ticks.groupBy(
    window(col("timestamp"), "5 minutes", "1 minute"),
    col("symbol")
).agg(
    avg("price").alias("avg_price"),
    stddev_samp("price").alias("volatility_stddev"),
    first("price").alias("first_price"),
    last("price").alias("last_price")
)

silver_with_indicators.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "dbfs:/pipelines/stock/silver/_checkpoints/stock_indicators") \
    .table("silver.stock_tick_indicators")`
  }
];

const CodeShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400"/>
            <h3 className="font-semibold text-gray-200">Engineering Implementation</h3>
        </div>
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
            {SNIPPETS.map((snippet, idx) => (
                <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === idx ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    {snippet.language === 'csharp' ? 'C# Producer' : 'PySpark Job'}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="mb-4">
            <h4 className="text-lg font-bold text-white mb-1">{SNIPPETS[activeTab].title}</h4>
            <p className="text-sm text-gray-400">{SNIPPETS[activeTab].description}</p>
        </div>

        <div className="relative flex-1 bg-gray-950 rounded-lg border border-gray-800 overflow-hidden group">
             <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-gray-800 rounded-md text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
             >
                {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
             </button>
             <div className="absolute inset-0 overflow-auto p-4">
                <pre className="font-mono text-sm text-blue-300">
                    <code>{SNIPPETS[activeTab].code}</code>
                </pre>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CodeShowcase;
