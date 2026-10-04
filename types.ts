export interface StockDataPoint {
  timestamp: string;
  price: number;
  ma5: number;
  rsi: number;
  volume: number;
}

export enum PipelineStage {
  INGESTION = 'Ingestion (Bronze)',
  PROCESSING = 'Processing (Silver)',
  STORAGE = 'Storage (Gold)',
  VISUALIZATION = 'Visualization'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  stage: PipelineStage;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface CodeSnippet {
  language: string;
  title: string;
  code: string;
  description: string;
}
