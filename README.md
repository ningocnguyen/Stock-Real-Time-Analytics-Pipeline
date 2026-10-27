# Real-Time Stock Analytics Pipeline

This repository contains a React dashboard, a Vercel API function for Gemini insights, a .NET stock-tick producer, and a Databricks streaming job. The dashboard generates its own demonstration data. It does not read from the producer, Event Hubs, or Databricks tables.

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/` | React dashboard, UI components, and browser-side API client |
| `api/ai.ts` | Vercel Function that calls Gemini with a server-side key |
| `backend/RealTimeStockProducer/` | .NET 8 producer that sends stock ticks to Azure Event Hubs |
| `databricks/` | PySpark Structured Streaming job that writes Delta aggregates |
| `index.html`, `vite.config.ts`, `tsconfig.json` | Frontend entry point and build configuration |

Vercel requires the function in the root `api/` directory. The function's request handler stays in that file so its deployed module has no relative runtime imports. The local Vite server exposes the same `/api/ai` route for development.

## Run the dashboard

Install Node.js, then run:

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `GEMINI_API_KEY` in `.env` if you want AI Insight and architecture explanations. The key is optional for the simulated stream. Keep `.env` private; it is ignored by Git and the key is never bundled into browser code. `npm run build` runs TypeScript checking before the Vite production build.

## Deploy the dashboard

Import this repository into Vercel with the repository root as the project root, `npm run build` as the build command, and `dist` as the output directory. Add `GEMINI_API_KEY` to the Vercel project's environment variables for Production and, if needed, Preview. Do not use a `VITE_` prefix for the key. Changing an environment variable requires a new deployment.

The public `/api/ai` endpoint can generate billable Gemini requests. Configure Google AI Studio spend controls and monitor usage before sharing the site widely. This deployment includes the dashboard and API function only.

## Run the producer

The producer requires the .NET 8 SDK, an Alpha Vantage API key, and an Azure Event Hubs namespace and hub. For local configuration, use `backend/RealTimeStockProducer/appsettings.json` or override values with environment variables such as `STOCK_PRODUCER_Producer__AlphaVantageApiKey` and `STOCK_PRODUCER_Producer__EventHubConnectionString`. Do not commit real credentials.

```sh
dotnet run --project backend/RealTimeStockProducer
```

It emits camel-case JSON fields (`symbol`, `price`, `volume`, `timestamp`) for the Databricks schema. Alpha Vantage limits and network failures can trigger synthetic fallback ticks.

## Run the Databricks job

The notebook at `databricks/silver_layer_stock_indicators.py` requires a Databricks cluster with a compatible Azure Event Hubs Spark connector and Delta Lake. Configure the `kv-scope` secret `event-hub-connection-string`, create the `silver` schema, and set a checkpoint location before running it. It writes windowed aggregates to `silver.stock_tick_indicators`.
