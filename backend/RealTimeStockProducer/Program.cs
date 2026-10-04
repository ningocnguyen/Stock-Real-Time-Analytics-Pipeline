using System.Globalization;
using System.Reactive.Concurrency;
using System.Reactive.Linq;
using System.Text;
using System.Text.Json;
using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Producer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RealTimeStockProducer;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables(prefix: "STOCK_PRODUCER_")
    .Build();

var settings = configuration.GetSection("Producer").Get<ProducerSettings>() ?? new ProducerSettings();

using var loggerFactory = LoggerFactory.Create(logging =>
{
    logging.ClearProviders();
    logging.AddSimpleConsole(options =>
    {
        options.TimestampFormat = "yyyy-MM-dd HH:mm:ss.fff zzz ";
        options.SingleLine = true;
    });
    logging.SetMinimumLevel(LogLevel.Information);
});

var logger = loggerFactory.CreateLogger("RealTimeStockProducer");

using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(settings.HttpTimeoutSeconds) };

await using var eventHubProducer = new EventHubProducerClient(
    settings.EventHubConnectionString,
    settings.EventHubName);

using var cancellation = new CancellationTokenSource();
Console.CancelKeyPress += (_, eventArgs) =>
{
    eventArgs.Cancel = true;
    cancellation.Cancel();
};

logger.LogInformation(
    "Starting stock producer for {Symbols} at target rate {Rate} msg/s.",
    string.Join(',', settings.Symbols),
    settings.TargetMessagesPerSecond);

var tickStream = Observable.Interval(TimeSpan.FromMilliseconds(1000d / settings.TargetMessagesPerSecond), TaskPoolScheduler.Default)
    .SelectMany(_ => Observable.FromAsync(ct => FetchStockTickAsync(settings, httpClient, logger, ct)))
    .Where(tick => tick is not null)
    .Select(tick => tick!)
    .Publish()
    .RefCount();

var senderSubscription = tickStream
    .Buffer(TimeSpan.FromMilliseconds(100), 50)
    .Where(batch => batch.Count > 0)
    .SelectMany(batch => Observable.FromAsync(ct => SendBatchAsync(eventHubProducer, batch, logger, ct)))
    .Subscribe(
        onNext: _ => { },
        onError: ex =>
        {
            logger.LogError(ex, "Fatal error in sender stream.");
            cancellation.Cancel();
        });

var monitorSubscription = tickStream
    .Buffer(TimeSpan.FromSeconds(1))
    .Subscribe(
        batch =>
        {
            if (batch.Count > 0)
            {
                logger.LogInformation("Throughput: {Count} messages/sec", batch.Count);
            }
        },
        ex => logger.LogError(ex, "Fatal error in monitor stream."));

try
{
    await Task.Delay(Timeout.InfiniteTimeSpan, cancellation.Token);
}
catch (OperationCanceledException)
{
    logger.LogInformation("Shutdown requested.");
}
finally
{
    senderSubscription.Dispose();
    monitorSubscription.Dispose();
}

return;

static async Task<StockTick?> FetchStockTickAsync(
    ProducerSettings settings,
    HttpClient httpClient,
    ILogger logger,
    CancellationToken cancellationToken)
{
    try
    {
        var symbol = settings.Symbols[Random.Shared.Next(settings.Symbols.Length)];
        var uri = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={settings.AlphaVantageApiKey}";

        using var response = await httpClient.GetAsync(uri, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!document.RootElement.TryGetProperty("Global Quote", out var quote) ||
            !quote.TryGetProperty("05. price", out var priceElement) ||
            !decimal.TryParse(priceElement.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var price) ||
            price <= 0)
        {
            logger.LogWarning("Alpha Vantage throttled/empty response. Falling back to synthetic tick.");
            return BuildSyntheticTick(symbol);
        }

        var volume = quote.TryGetProperty("06. volume", out var volumeElement) &&
                     long.TryParse(volumeElement.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedVolume)
            ? parsedVolume
            : Random.Shared.NextInt64(50_000, 2_000_000);

        return new StockTick
        {
            Symbol = symbol,
            Price = decimal.Round(price, 2),
            Volume = volume,
            Timestamp = DateTimeOffset.UtcNow
        };
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
    {
        var symbol = settings.Symbols[Random.Shared.Next(settings.Symbols.Length)];
        logger.LogWarning(ex, "Failed to fetch live stock tick for {Symbol}. Using synthetic fallback.", symbol);
        return BuildSyntheticTick(symbol);
    }
}

static StockTick BuildSyntheticTick(string symbol)
{
    var baseline = symbol switch
    {
        "MSFT" => 420m,
        "NVDA" => 890m,
        "GOOGL" => 172m,
        _ => 190m
    };

    var delta = Convert.ToDecimal((Random.Shared.NextDouble() - 0.5) * 4);

    return new StockTick
    {
        Symbol = symbol,
        Price = decimal.Round(baseline + delta, 2),
        Volume = Random.Shared.NextInt64(100_000, 4_000_000),
        Timestamp = DateTimeOffset.UtcNow
    };
}

static async Task SendBatchAsync(
    EventHubProducerClient producerClient,
    IReadOnlyCollection<StockTick> batch,
    ILogger logger,
    CancellationToken cancellationToken)
{
    try
    {
        using var eventBatch = await producerClient.CreateBatchAsync(cancellationToken);

        foreach (var tick in batch)
        {
            var payload = JsonSerializer.SerializeToUtf8Bytes(tick);
            if (!eventBatch.TryAdd(new EventData(payload)))
            {
                logger.LogWarning("Batch reached capacity after {Count} events. Sending partial batch.", eventBatch.Count);
                break;
            }
        }

        if (eventBatch.Count == 0)
        {
            logger.LogWarning("Skipping empty Event Hub batch.");
            return;
        }

        await producerClient.SendAsync(eventBatch, cancellationToken);
        logger.LogDebug("Sent batch with {Count} stock ticks.", eventBatch.Count);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed sending batch to Event Hub.");
    }
}
