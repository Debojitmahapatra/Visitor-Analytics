
# 🧭 Real-Time Visitor Analytics System

> A full-stack project built for the API Developer Intern Technical Assessment.  
Tracks website visitor behavior in real-time using Node.js, Express, MongoDB, and WebSockets (Socket.IO), with a live frontend dashboard.

---

## 🚀 Features

- 📡 **Real-Time Dashboard Updates** via WebSocket
- 📊 **Mini Chart** of visitors over last 10 minutes (Chart.js)
- 🔍 **Session Tracking** with page journey and duration
- 🌍 **Country/Page Filtering** with structured results
- 💬 **Messaging System** with optional session targeting
- 🔌 **Connection Events** (`user_connected`, `user_disconnected`)
- ⚠️ **Alerts System** for milestone or warning messages

---

## 🛠 Tech Stack

| Layer     | Tech Used                        |
|-----------|----------------------------------|
| Backend   | Node.js, Express.js, MongoDB     |
| WebSocket | Socket.IO                        |
| Frontend  | HTML, CSS, JavaScript (Vanilla)  |
| Charting  | Chart.js                         |
| Testing   | Postman (for simulating events)  |

---



## ⚙️ Setup & Run Locally

### 1. Clone Repo & Install Dependencies

```bash
git clone <your-repo-url>
cd visitor-analytics
npm install
2. Setup .env
env
Copy
Edit
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visitor-analytics
3. Start Server
bash
Copy
Edit
npx nodemon server.js
Server runs at http://localhost:5000

📡 API Endpoints
POST /api/events
Send visitor events:

json
Copy
Edit
{
  "type": "pageview",
  "page": "/home",
  "sessionId": "user-123",
  "timestamp": "2025-07-19T10:30:00Z",
  "country": "India"
}
GET /api/analytics/summary
Returns live visitor stats.

GET /api/analytics/sessions
Returns session journeys and durations.

🔁 WebSocket Events
Server → Dashboard
Event	Payload Summary
visitor_update	New visitor + summary stats
session_activity	Visitor journey & duration
user_connected	Dashboard connected
user_disconnected	Dashboard left
alert	Info, warning, milestone messages

Dashboard → Server
Event	Purpose
request_detailed_stats	Filtered analytics by country/page
track_dashboard_action	Logs dashboard filters
send_message	Dashboard message broadcast

🧠 Filtering & Structured View
Filtered events are grouped like:

json
Copy
Edit
{
  "India": {
    "user-123": {
      "visit": {
        "/home": 2,
        "/products": 1
      }
    }
  }
}
Displayed in a styled, nested UI on the dashboard.

📈 Mini Chart
Visitors are charted over the last 10 minutes using Chart.js — auto-updates every time a new event is received.

🧪 Testing Tips
Start the server

Open two dashboards:

arduino
Copy
Edit
http://localhost:5000
Use Postman to POST visitor events

Watch real-time updates, journey, chart, and filters appear live!

📹 Demo Video Guide
Suggested Flow for Recording:
Overview of project folders

Start backend and open dashboard

Send events via Postman (pageview, session_end)

Show live updates in dashboard

Apply filters and show structured view

Send messages and alerts

Demonstrate disconnect handling

👨‍💻 Author
Debojit Mahapatra
API Developer Intern Assessment
July 2025

