namespace RealTimeStockProducer;

public sealed class StockTick
{
    public required string Symbol { get; init; }
    public required decimal Price { get; init; }
    public required long Volume { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
}
