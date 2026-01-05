# Project Architecture Flowchart

The following flowchart shows how different components of the project are organized and interact with each other.

```mermaid
flowchart TB
  subgraph Frontend[Frontend - React]
    A[MultiStepForm]
    B[Steps: Personal, Address, Education, WorkExperience, Review]
    C[LocalStorage: draft & step]
    D[Axios -> Backend /api/submit]
  end

  subgraph Backend[Backend - Node/Express]
    E[Routes: /api/submit, /api/applications, /health, /metrics]
    F[Models: Application (Mongoose)]
    G[Logging: Pino -> backend/logs/backend.log]
    H[Metrics: prom-client -> /metrics]
  end

  subgraph DB[MongoDB]
    I[applications collection]
  end

  subgraph Observability[Monitoring Stack]
    J[Prometheus: scrape /metrics]
    K[Grafana: dashboards]
    L[Loki + Promtail: collect logs from backend/logs]
  end

  A --> B
  A --> C
  A --> D
  D --> E
  E --> F
  F --> I
  E --> G
  E --> H
  H --> J
  G --> L
  J --> K
  L --> K
```

---

### Visual diagram

![Architecture diagram](images/architecture.svg)
