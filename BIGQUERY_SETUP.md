# BigQuery Setup (Optional Analytics)

VoteMitra can log structured analytics events to BigQuery when these env vars are set:

- `GOOGLE_CLOUD_PROJECT`
- `BIGQUERY_DATASET`
- `BIGQUERY_TABLE`

## 1) Create Dataset

```sql
CREATE SCHEMA IF NOT EXISTS `your_project_id.votemitra_analytics`
OPTIONS(location="US");
```

## 2) Create Events Table

```sql
CREATE TABLE IF NOT EXISTS `your_project_id.votemitra_analytics.events` (
  eventType STRING,
  timestamp TIMESTAMP,
  service STRING,
  sessionId STRING,
  source STRING,
  responseLength INT64,
  messagePreview STRING,
  difficulty STRING,
  topic STRING,
  questionCount INT64,
  flashcardCount INT64,
  error STRING
);
```

## 3) Configure Environment

```env
GOOGLE_CLOUD_PROJECT=your_project_id
BIGQUERY_DATASET=votemitra_analytics
BIGQUERY_TABLE=events
```

## 4) Verify Data Flow

```sql
SELECT
  eventType,
  COUNT(*) AS total_events
FROM `your_project_id.votemitra_analytics.events`
GROUP BY eventType
ORDER BY total_events DESC;
```
