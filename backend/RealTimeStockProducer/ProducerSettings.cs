namespace RealTimeStockProducer;

public sealed class ProducerSettings
{
    public string AlphaVantageApiKey { get; init; } = "demo";
    public string[] Symbols { get; init; } = ["AAPL", "MSFT", "NVDA", "GOOGL"];
    public string EventHubConnectionString { get; init; } = string.Empty;
    public string EventHubName { get; init; } = "stock-ticks-bronze";
    public int TargetMessagesPerSecond { get; init; } = 120;
    public int HttpTimeoutSeconds { get; init; } = 10;
}
