# 📈 Real-Time Stock Analytics Pipeline
### *Full-Scale Medallion Architecture Implementation*

This project is a high-performance **End-to-End Data Engineering** showcase. It bridges the gap between high-throughput backend ingestion and real-time frontend visualization, utilizing a production-grade stack of **Azure**, **Databricks**, **.NET 8**, and **React**.

---

## 🚀 System Architecture
Built on the industry-standard **Medallion Architecture**, this pipeline manages the complete lifecycle of financial data:

* **Ingestion (Bronze Layer):** A **C# / .NET 8** producer polls **Alpha Vantage** and sends stock ticks to **Azure Event Hubs**. Its configured target is 120 messages/sec, with synthetic fallback ticks when quotes are unavailable.
* **Processing (Silver Layer):** **Spark Structured Streaming (PySpark)** on **Databricks** executes complex sliding-window aggregations (5min window / 1min slide) to compute real-time **RSI** and **Volatility** metrics.
* **Storage (Gold Layer):** Refined, business-ready data is persisted into **ACID-compliant Delta Lake** tables, ensuring total data integrity for historical analysis and downstream consumption.

---

## ⚡ Key Features

### 1. High-Frequency Ingestion Engine
* **Rx.NET Integration:** Leverages **Reactive Extensions** in C# to buffer and manage massive data spikes without latency or backpressure.
* **Resilient Design:** Features automated synthetic fallback generation to ensure the dashboard remains live even during API rate-limiting or outages.

### 2. Live Engineering Dashboard
* **Sub-Second Visuals:** Dynamic Area and Line charts built with `recharts` that update in real-time to provide immediate market insights.
* **Interactive Architecture:** A clickable system diagram powered by **Gemini AI** that explains technical cloud components on-demand.

### 3. AI Market Analyst
* **LLM Integration:** Built-in **Google Gemini 3.8 Flash** acts as a virtual "Senior Financial Analyst".
* **Context-Aware Insights:** Automatically parses live price action, RSI trends, and volatility to generate natural language market reports.

---

## 🛠️ Tech Stack

### **Data Engineering (The "Guts")**
* **Languages:** C# (.NET 8), Python (PySpark), SQL (Delta Lake).
* **Streaming & Cloud:** Azure Event Hubs, Azure Data Lake Storage Gen2.
* **Compute:** Azure Databricks (Spark Structured Streaming).

### **Frontend & AI**
* **UI Framework:** React 19, TypeScript, Tailwind CSS.
* **AI Engine:** Google GenAI SDK (`@google/genai`).

---

## 🎯 How It Works
1.  **Select & Stream:** Choose an asset (AAPL, MSFT, BTC) and hit "Start Stream" to activate the pipeline.
2.  **Monitor Processing:** Open the **System Logs** drawer to see raw data transition through Bronze, Silver, and Gold stages in real-time.
3.  **Audit the Implementation:** Switch to the **"Implementation View"** to inspect the production C# and PySpark logic powering the backend.

---

## Run the dashboard

Requires Node.js and npm. Run `npm ci` and then `npm run dev`. Open the local address printed by Vite. The dashboard simulates streaming prices; it does not read the Event Hubs or Delta tables created by the backend.

For AI explanations, copy `.env.example` to `.env` and set `GEMINI_API_KEY` to a [Google AI Studio](https://aistudio.google.com/) key. The simulation runs without a key; AI requests return an unavailable message. The local Vite server handles `/api/ai`, so the key stays on the server and is not bundled into browser code.

## Deploy the dashboard on Vercel

1. Commit and push this project to your GitHub repository. The `.env` file is ignored and must stay out of Git.
2. In Vercel, create a new project and import that GitHub repository. Choose the Vite framework preset, leave the root directory as the repository root, use `npm run build` as the build command, and `dist` as the output directory.
3. In the Vercel project's Environment Variables settings, add `GEMINI_API_KEY` with your Gemini key for Production (and Preview if you want AI features in previews). Do not add a `VITE_` prefix.
4. Deploy, then open the Vercel URL and test **Start Stream**, **AI Insight**, and the architecture explanations. If you add or change the key after deployment, redeploy for the new setting to take effect.

The deployed dashboard uses simulated stock data. The `/api/ai` Vercel Function handles Gemini requests; it does not deploy or connect the .NET producer and Databricks pipeline. Because this endpoint is public, set appropriate API quotas and monitor usage before sharing the site widely.

## Run the producer

Requires the .NET 8 SDK, an Event Hubs namespace and hub, and an Alpha Vantage API key. Configure `backend/RealTimeStockProducer/appsettings.json` for local development, or override values with environment variables such as `STOCK_PRODUCER_Producer__EventHubConnectionString` and `STOCK_PRODUCER_Producer__AlphaVantageApiKey`. Do not commit real credentials. Start it with:

```sh
dotnet run --project backend/RealTimeStockProducer
```

The producer sends camel-case JSON fields (`symbol`, `price`, `volume`, `timestamp`) expected by the Databricks schema. The configured target rate is a tick-generation rate; Alpha Vantage limits and network latency can cause synthetic fallback ticks.

## Run the Databricks job

Requires an Azure Databricks cluster with a compatible Azure Event Hubs Spark connector and Delta Lake, plus a `kv-scope` secret named `event-hub-connection-string`. That secret must contain an Event Hub connection string for the hub receiving the producer's messages. Create the `silver` schema and configure the checkpoint location before running `databricks/silver_layer_stock_indicators.py` as a notebook or job. The notebook writes windowed aggregates to `silver.stock_tick_indicators`.
