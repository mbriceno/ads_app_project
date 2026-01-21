import os

import psycopg2
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, from_json, struct, to_json, when
from pyspark.sql.types import StringType, StructField, StructType

# Configuración de conexión (Mismos datos que usas en JDBC)
load_dotenv()
DB_CONFIG = {
    "dbname": os.getenv("DB_DATABASE"),
    "user": os.getenv("DB_USERNAME"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}
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
    .option("kafka.bootstrap.servers", os.getenv("KAFKA_BOOTSTRAP_SERVERS")) \
    .option("subscribe", os.getenv("KAFKA_INPUT_TOPIC")) \
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
    when(
        col("impressions") > 0, (col("clicks") / col("impressions")) * 100,
    ).otherwise(0),
)


# 5. WRITING RESULTS IN POSTGRES (Warehouse) AND KAFKA
def write_to_kafka(batch_df) -> None:
    batch_df.select(
        col("adId").alias("key"),
        to_json(
            struct(
                col("adId"),
                col("impressions"),
                col("clicks"),
                col("ctr"),
            ),
        ).alias("value"),
    ).write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", os.getenv("KAFKA_BOOTSTRAP_SERVERS", "redpanda-node:9092")) \
        .option("topic", os.getenv("KAFKA_OUTPUT_TOPIC")) \
        .save()
    print("🚀 Resultados enviados a KAFKA para visualización.")


def write_to_postgres_upsert(batch_df, batch_id) -> None:
    print(f"⏳ Escribiendo lote {batch_id} en tabla temporal...")
    batch_df.write \
        .format("jdbc") \
        .option("url", f"jdbc:postgresql://{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}") \
        .option("dbtable", "ad_stats_temp") \
        .option("user", DB_CONFIG["user"]) \
        .option("password", DB_CONFIG["password"]) \
        .option("driver", "org.postgresql.Driver") \
        .mode("overwrite") \
        .save()

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        merge_query = """
        INSERT INTO ad_stats ("adId", impressions, clicks, ctr)
        SELECT "adId", impressions, clicks, ctr FROM ad_stats_temp
        ON CONFLICT ("adId")
        DO UPDATE SET
            impressions = EXCLUDED.impressions,
            clicks = EXCLUDED.clicks,
            ctr = EXCLUDED.ctr;
        """

        cur.execute(merge_query)
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Lote {batch_id} fusionado (Upsert) correctamente en ad_stats.")

    except Exception as e:
        print(f"❌ Error en el Upsert SQL: {e}")


def process_batch(batch_df, batch_id) -> None:
    # Saving on DB
    write_to_postgres_upsert(batch_df, batch_id)

    # Send notification to Kafka, probably to show results in an admin panel
    write_to_kafka(batch_df)


# Iniciamos el stream
query = stats_df.writeStream \
    .outputMode("complete") \
    .foreachBatch(process_batch) \
    .option("checkpointLocation", "/tmp/spark_checkpoint_dual") \
    .start()

print("🚀 Spark Streaming iniciado... Esperando eventos de Kafka...")
query.awaitTermination()
