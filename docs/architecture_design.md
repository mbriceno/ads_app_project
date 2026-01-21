---
title: Real-Time Data Pipeline App - Architecture Design
---

flowchart TD
    A[Usuario] -->|interact| B[Angular Frontend]

    B -->|"Raw events<br>(clicks + impressions)"| C["API Gateway<br>(NestJS)"]

    C -->|immediately publishing| D[Kafka / Redpanda<br>Topic: ad-events]

    D -->|consume| E[Stream Processing<br>Apache Spark]

    E -->|calculate CTR, totals<br>checkpoints for<br>fault-tolerance| E

    subgraph "Spark: Two Sinks"
        E -->|UPSERT metrics| F["PostgreSQL<br>Analytics DB"]
        E -->|Publishes the processed <br>and updated metrics| G[Kafka<br>Topic: ad-stats-results]
    end

    G -->|consume| H["Real-time<br>Notification Service<br>(NestJS Consumer)"]

    H -->|instant data delivery| I["WebSocket Server<br>(Socket.io)"]

    I -->|push real-time metrics| B

    B -->|updated UI without <br>browser reload| J[User sees updated metrics]

    %% Estilos para mayor claridad
    classDef frontend fill:#e6f7ff,stroke:#1890ff
    classDef gateway fill:#fff1b8,stroke:#d4b106
    classDef queue fill:#d9f7be,stroke:#389e0d
    classDef processing fill:#ffd6e7,stroke:#c41d7f
    classDef db fill:#f0f5ff,stroke:#2f54eb
    classDef ws fill:#e6fffb,stroke:#13c2c2

    class B,J frontend
    class C gateway
    class D,G queue
    class E processing
    class F db
    class I,H ws

    %% Notas laterales
    linkStyle default stroke:#555,stroke-width:1.5px