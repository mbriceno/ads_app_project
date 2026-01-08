# Ads App Project

This repository contains a multi-service architecture for an advertising application, split into three main components: orchestration, backend services, and data processing.

## Project Structure

The project is organized into the following directories:

1.  **`ads_app_server`**: Contains Docker configurations to orchestrate the environment (likely databases, brokers, etc.).
2.  **`ads_app_kafka`**: A NestJS application that acts as the backend service, integrating with Kafka.
3.  **`ads_app_spark`**: A Python project using Apache Spark for data processing and analytics.

---

## Prerequisites

Ensure you have the following installed on your machine:
*   **Docker** and **Docker Compose**
*   **Node.js** (LTS version recommended)
*   **Python 3.8+**
*   **Java 8/11** (Required for Apache Spark)

---

## Getting Started

### 1. ads_app_server (Docker Environment)

This folder contains the container orchestration logic. You should start this first to ensure infrastructure dependencies (like Kafka, Zookeeper, or Databases) are running.

**Run:**
```bash
cd ads_app_server

# Start the services in detached mode
docker-compose up -d
```

To stop the services:
```bash
docker-compose down
```

### 2. ads_app_kafka (NestJS Backend)

This is the main application logic built with NestJS.

**Setup & Run:**
```bash
cd ads_app_kafka

# Install dependencies
npm install

# Run in development mode (watch mode)
npm run start:dev
```

*The application will typically be available at `http://localhost:3000` (or the port configured in your `.env`).*

### 3. ads_app_spark (Data Processing)

This folder contains the PySpark logic for processing data streams or batches.

**Setup & Run:**
```bash
cd ads_app_spark

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the main spark job (example command)
python main.py
```

> **Note:**
> The above code is only to run spark manually. When you run docker-compose up in ads_app_server folder a server for Spark is started.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.