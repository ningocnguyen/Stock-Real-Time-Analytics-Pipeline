# 📈 Real-Time Stock Analytics Pipeline
### *Full-Scale Medallion Architecture Implementation*

This project is a high-performance **End-to-End Data Engineering** showcase. It bridges the gap between high-throughput backend ingestion and real-time frontend visualization, utilizing a production-grade stack of **Azure**, **Databricks**, **.NET 8**, and **React**.

---

## 🚀 System Architecture
Built on the industry-standard **Medallion Architecture**, this pipeline manages the complete lifecycle of financial data:

* **Ingestion (Bronze Layer):** A high-throughput **C# / .NET 8** Producer ingests live market data from **Alpha Vantage APIs** and streams it into **Azure Event Hubs** at 1,000+ msgs/sec.
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
* **LLM Integration:** Built-in **Google Gemini 3 Flash** acts as a virtual "Senior Financial Analyst".
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

## 📝 Setup & API Usage
To enable the **AI Market Analyst** and interactive explanations, a Google Gemini API Key is required:

1.  Obtain a free key from [Google AI Studio](https://aistudio.google.com/).
2.  Create a `.env` file in the root directory.
3.  Add your key: `VITE_API_KEY=your_key_here`.

---

*Note: The dashboard functions as a standalone demo, but backend features require the Gemini API for full interactivity.*
