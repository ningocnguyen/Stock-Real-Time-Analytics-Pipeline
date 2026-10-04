# Databricks notebook source
from pyspark.sql import functions as F
from pyspark.sql.types import StructField, StructType, StringType, DoubleType, LongType, TimestampType

# COMMAND ----------
# Configure Event Hubs connector (replace placeholders with real values/secret scopes).
ehConf = {
    "eventhubs.connectionString": dbutils.secrets.get("kv-scope", "event-hub-connection-string"),
    "eventhubs.consumerGroup": "$Default",
}

stock_schema = StructType(
    [
        StructField("symbol", StringType(), False),
        StructField("price", DoubleType(), False),
        StructField("volume", LongType(), True),
        StructField("timestamp", TimestampType(), False),
    ]
)

raw_stream = (
    spark.readStream.format("eventhubs")
    .options(**ehConf)
    .load()
)

parsed_ticks = (
    raw_stream
    .select(F.col("body").cast("string").alias("payload"))
    .select(F.from_json("payload", stock_schema).alias("tick"))
    .select("tick.*")
    .withWatermark("timestamp", "10 minutes")
)

# COMMAND ----------
# Sliding window aggregation: 5 minute window, 1 minute slide.
windowed_stats = (
    parsed_ticks.groupBy(
        F.window("timestamp", "5 minutes", "1 minute"),
        F.col("symbol"),
    )
    .agg(
        F.avg("price").alias("avg_price"),
        F.stddev_samp("price").alias("volatility_stddev"),
        F.count("*").alias("tick_count"),
        F.first("price").alias("first_price"),
        F.last("price").alias("last_price"),
    )
)

# RSI approximation based on first/last movement inside each sliding window.
# RSI = 100 - (100 / (1 + RS)), where RS = avg_gain / avg_loss.
silver_with_indicators = (
    windowed_stats
    .withColumn("price_change", F.col("last_price") - F.col("first_price"))
    .withColumn("avg_gain", F.greatest(F.col("price_change"), F.lit(0.0)))
    .withColumn("avg_loss", F.abs(F.least(F.col("price_change"), F.lit(0.0))))
    .withColumn(
        "rsi",
        F.when(F.col("avg_loss") == 0, F.lit(100.0))
        .otherwise(100 - (100 / (1 + (F.col("avg_gain") / F.col("avg_loss"))))),
    )
    .select(
        F.col("symbol"),
        F.col("window.start").alias("window_start"),
        F.col("window.end").alias("window_end"),
        F.round("avg_price", 4).alias("avg_price"),
        F.round("volatility_stddev", 6).alias("volatility_stddev"),
        F.round("rsi", 4).alias("rsi"),
        F.col("tick_count"),
        F.current_timestamp().alias("processed_at"),
    )
)

# COMMAND ----------
(
    silver_with_indicators.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "dbfs:/pipelines/stock/silver/_checkpoints/stock_indicators")
    .trigger(processingTime="1 minute")
    .table("silver.stock_tick_indicators")
)
