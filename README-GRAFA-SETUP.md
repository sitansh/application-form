Grafana / Prometheus / Loki local setup (development)

This project now includes quickstart configuration to run a local observability stack using Docker Compose:

- Prometheus (9090) - scrapes metrics from the backend (/metrics)
- Grafana (3001) - visualize metrics/logs (admin/admin)
- Loki (3100) - log ingestion
- Promtail (9080) - ships backend logs from ./logs to Loki

Quick steps
1. Make sure Docker is installed and running.
2. Start the stack from project root:
   docker-compose up -d

3. If Prometheus cannot reach the backend (target will be `host.docker.internal:5000` in `prometheus/prometheus.yml`) and you're on Linux, replace `host.docker.internal` with your host's IP address (or run the backend inside Docker and update targets accordingly).

4. Open Grafana: http://localhost:3001 (default admin password is `admin`).
   - Add Prometheus (http://prometheus:9090) and Loki (http://loki:3100) as data sources.
   - Import dashboards or create new ones: e.g., show `application_submissions_total`, histograms, and / or create alerts.

Notes
- Backend writes structured JSON logs to `./logs/backend.log` (pino format). Promtail tails this file and forwards to Loki.
- Metrics are exposed at `http://localhost:5000/metrics` (Prometheus format).
- You can tune PROMETHEUS scrape targets and Promtail config in the `prometheus/` and `promtail/` folders.

Security & Production
- For production, use secure credentials, TLS, and proper provisioning. Consider using Grafana Cloud if you prefer a managed stack.
