# PXMonitor: Your AI-Powered Network Co-Pilot

PXMonitor is a sophisticated, real-time network monitoring and diagnostic application designed to demystify your network's behavior. It provides a clear, actionable, and intelligent view of your local network's health, moving beyond raw numbers to offer AI-driven insights and one-click solutions to common problems.

Whether you're a developer debugging a network-dependent application, a gamer trying to diagnose lag, or simply a curious user, PXMonitor gives you the tools to understand, analyze, and improve your network connection.

---

## ✨ Features

This project is packed with features that provide a comprehensive monitoring and diagnostic experience:

#### **📊 Live Performance Dashboard**
- **Real-Time Metrics:** Instantly view critical network health indicators like **Latency**, **Jitter**, **Packet Loss**, and available **Bandwidth**.
- **Network Health Score:** An at-a-glance score from 1-100 that summarizes your network's overall performance.
- **Dynamic Visualization:** See your data come to life with live-updating charts and gauges powered by the Recharts library.

#### **🔬 Deep Traffic Analysis**
- **Protocol Distribution:** A donut chart showing the percentage of traffic for each protocol (e.g., TLSv1.2, TCP, UDP, DNS), helping you understand what your network is doing.
- **Top Application Usage:** Identify which applications are consuming the most bandwidth.

#### **🤖 AI-Enhanced Insights**
- **One-Click Explanations:** Don't understand what a chart means? Click the analysis button, and the integrated Google Gemini AI will provide a simple, easy-to-understand explanation of the data.
- **Comprehensive AI Reports:** Generate a detailed, holistic analysis of your entire network's current state. The AI reviews all metrics and provides a full report with summaries and actionable advice.

#### **🛠️ Interactive Diagnostics & Repair Toolkit**
- **Live Problem Detection:** The Diagnosis page shows live data for potential issues, such as high DNS response times or ping latency.
- **One-Click Fixes:** Execute powerful PowerShell troubleshooting scripts directly from the UI. The toolkit includes:
  - **Flush DNS Cache:** Resolve stale or incorrect DNS records.
  - **Reset Network IP:** Renew your IP lease to fix conflicts.
  - **Reconnect Wi-Fi:** Quickly re-establish your wireless connection.
  - **Optimize Bandwidth:** Close non-essential, high-bandwidth background applications.
  - **Clear Network Congestion:** Attempt to resolve local network congestion.
- **Instant Feedback:** The UI automatically refreshes after a script is run, showing you the "before and after" state to confirm if the fix was successful.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js** (v18.x or later)
- **npm** or **yarn**
- **Npcap:** This is essential. TShark requires this driver to capture network traffic on Windows. Download and install it from the [official Npcap website](https://npcap.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/devanathandna/PXMonitor-Real-time-Network-Monitoring-Diagnostic-Application
    cd pxmonitor
    ```

2.  **Install dependencies for both frontend and backend:**
    ```bash
    # Install root (frontend) dependencies
    npm install

    # Install backend dependencies
    cd backend
    npm install
    cd ..
    ```

3.  **Add your Google Gemini API Key:**
    For the AI features to work, you must provide your API key. Find the following two files and add your key:
    - `src/services/gemini-service.ts`
    - `src/services/gemini_file.ts`

    In both files, replace the placeholder string:
    ```typescript
    const API_KEY = "YOUR_API_KEY"; 
    ```

4.  **Run the Application:**
    You need two separate terminals to run the application.

    - **Terminal 1: Start the Backend Server**
      ```bash
      cd backend
      node index.js
      ```
      *The backend will now be running on `http://localhost:3001`.*

    - **Terminal 2: Start the Frontend Dev Server**
      ```bash
      # From the project's root directory
      npm run dev
      ```
      *The frontend will be available at `http://localhost:5173` (or the next available port).*

