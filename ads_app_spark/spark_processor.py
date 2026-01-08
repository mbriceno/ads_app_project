from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, from_json, when
from pyspark.sql.types import StringType, StructField, StructType

spark = SparkSession.builder.appName("AdTechCTRAnalyzer").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# 2. Squema from nestjs data
# NestJs send: { "adId": "...", "type": "..." }
json_schema = StructType([
    StructField("adId", StringType(), True),
    StructField("type", StringType(), True),
])

# 3. Read from KAFKA (Ingest)
# Replace 'redpanda-node' by the correct URL of kafka server
# TODO: replace with environment variable
kafka_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "redpanda-node:9092") \
    .option("subscribe", "ad-events") \
    .option("startingOffsets", "earliest") \
    .load()

# 4. Proccesing (business logic)
# Parser bytes from Kafka into usable columns
parsed_df = kafka_df.select(
    from_json(col("value").cast("string"), json_schema).alias("data"),
).select("data.*")

# Calculate metrics (Impressions, Clicks, CTR)
# Group by adId
stats_df = parsed_df.groupBy("adId").agg(
    count(when(col("type") == "impression", 1)).alias("impressions"),
    count(when(col("type") == "click", 1)).alias("clicks"),
).withColumn(
    "ctr",
    (col("clicks") / col("impressions")) * 100,
)


# 5. WRITING RESULTS IN POSTGRES (Warehouse)
def write_to_postgres(batch_df, batch_id):
    # The "append" mode won't work here because we want to update existing rows.
    # Standard Spark doesn't easily support native JDBC "Upsert" (Update or Insert).
    # For simplicity, we'll use "overwrite" in this tutorial (it deletes and writes to the current table).
    # NOTE: In a real production environment, you would use Delta Lake or a custom JDBC query to perform UPSERT.
    print(f"Escribiendo lote {batch_id} en Postgres...")

    batch_df.write \
        .format("jdbc") \
        .option("url", "jdbc:postgresql://postgres:5432/kafka_test") \
        .option("dbtable", "ad_stats") \
        .option("user", "admin") \
        .option("password", "1q2w3e4r5t") \
        .option("driver", "org.postgresql.Driver") \
        .mode("overwrite") \
        .save()


# Iniciamos el stream
query = stats_df.writeStream \
    .outputMode("complete") \
    .foreachBatch(write_to_postgres) \
    .start()

print("🚀 Spark Streaming iniciado... Esperando eventos de Kafka...")
query.awaitTermination()
