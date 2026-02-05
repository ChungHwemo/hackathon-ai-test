# Demo Sample Data

Quick reference for hackathon demo. Copy and paste these examples.

---

## 1. JIRA Automation

### Japanese Input
```
モバイルSafariでログインが失敗する問題が報告されています。
正しい認証情報を入力しても「セッション期限切れ」エラーが表示されます。
優先度は高く、次スプリントまでに調査・修正が必要です。
影響ユーザー: 約500名（iOS利用者の30%）
```

### English Input
```
Users report that login fails on mobile Safari.
Error message shows "Session expired" after entering correct credentials.
High priority - needs investigation and fix by next sprint.
Affected users: ~500 (30% of iOS users)
```

---

## 2. Knowledge Search

### Queries
```
CloudWatch alarm handling procedure
```

```
JIRA workflow best practices
```

```
Authentication token refresh mechanism
```

```
FIC-cloudwatch-alarm-009
```

---

## 3. PR Review

### Sample URLs (use any public GitHub PR)
```
https://github.com/vercel/next.js/pull/75000
```

```
https://github.com/facebook/react/pull/32000
```

### Or create a demo PR in your own repo with:
- A simple bug fix
- Some TypeScript code
- Maybe a small security issue to catch

---

## 4. Error Log Analysis

### Java Error
```
2026-02-05 10:23:45 ERROR [FIC-cloudwatch-alarm-009] 
Connection timeout to RDS instance db-prod-01
Retry attempt 3/3 failed
java.sql.SQLException: Connection timed out
  at com.mysql.jdbc.ConnectionImpl.connect(ConnectionImpl.java:1234)
  at com.cainz.service.DatabaseService.getConnection(DatabaseService.java:45)
  at com.cainz.api.UserController.getUser(UserController.java:89)
```

### Node.js Error
```
2026-02-05 14:55:32 ERROR [payment-service]
UnhandledPromiseRejectionWarning: Error: ETIMEDOUT
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)
    at Protocol._enqueue (/app/node_modules/mysql/lib/protocol/Protocol.js:144:48)
    at Connection.query (/app/node_modules/mysql/lib/Connection.js:201:25)
    at /app/services/payment.js:42:12
```

### Python Error
```
2026-02-05 16:30:00 ERROR [data-pipeline]
Traceback (most recent call last):
  File "/app/pipeline/processor.py", line 89, in process_batch
    result = self.transform(data)
  File "/app/pipeline/transformer.py", line 45, in transform
    return json.loads(raw_data)
json.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

---

## Quick Demo Checklist

Before starting demo:
- [ ] Dev server running at http://localhost:5173
- [ ] This file open in another window for copy/paste
- [ ] Browser zoomed to 125% for visibility
- [ ] Network connection stable
- [ ] Backup screenshots ready in `docs/screenshots/`

---

## Fallback: Screenshot Locations

If live demo fails:
```
docs/screenshots/dashboard-ja.png
docs/screenshots/jira-analysis-result.png
docs/screenshots/knowledge-results.png
docs/screenshots/pr-review-result.png
docs/screenshots/error-log-result.png
```
