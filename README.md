# Titan Concierge Agent (Website B)

An autonomous concierge agent designed to manage predictive maintenance and tire replacement logistics for an elite Lamborghini Aventador SVJ owner traveling through the Isan region of Thailand (near Highway 201 and Khon Kaen).

This app serves as the host **A2UI** framework, integrating real-time telemetry ingestion, autonomous storefront agent negotiations (**A2A**), and secure spending authorization via the Agent Payments Protocol (**AP2**).

---

## 🎨 Sophisticated Dark Visual Theme
This app is styled strictly under the **Sophisticated Dark** visual aesthetic:
*   **Color Palette:** Deep obsidian `#050505` background, muted `#0A0A0A` header panels, high-contrast gold `#D4AF37` highlights, and crisp `#F5F2ED` typography.
*   **Typography:** Elegant *Cormorant Garamond* paired with high-readability *Inter* for interfaces and *JetBrains Mono* for telemetry logs and code output.
*   **Interactive 3D Chassis Hotspots:** Embedded interactive Lamborghini wireframe layout with dynamic, glowing hotspots highlighting real-time tyre alerts.

---

## 🚀 Core Protocols & Architecture

### 1. Telemetry Ingestion (MCP)
Tracks real-time Michelin SmartWear tyre sensors predicting tread wear to the millimeter. Automatically flags critical wear thresholds (e.g. 82% worn, 115°C temperature spike, and 22 PSI pressure drop on the Rear-Left tire).

### 2. User Interface (A2UI & MCP Apps)
Serves as the elegant host container for the 3D tyre selector. When the user interacts with the wireframe model, the wrapper detects state changes, highlighting detailed structural parameters (Tread thickness, Pressure, and Thermal conditions) on the fly.

### 3. Agent-to-Agent Negotiation (A2A)
Runs as the A2A Client. Fetches the Storefront Agent Card (from Website A) to confirm stock availability, books an immediate fitting slot with Slick Mobile Dispatch, and negotiates pricing autonomously.

### 4. Secure Checkout (AP2)
Authorized through biometrics (press-and-hold fingerprint confirmation), executing secure transactions within pre-approved spending limits (฿250,000 maximum limit; ฿205,000 negotiated cost).

### 5. Google Maps Grounding & AI Assistant
Powered server-side by `gemini-3.5-flash` with direct Google Maps Grounding enabled. Provides real-time bypass recommendations around construction hazards on Highway 201 near Khon Kaen, local recommendations, and elite concierge logistics.

---

## 📂 Getting Started

### Prerequisites
*   Node.js 18+ / 20+
*   Google Gemini API Key (set as `GEMINI_API_KEY` in environment variables)

### Installation
1.  Install packages:
    ```bash
    npm install
    ```
2.  Set up environment:
    Create a `.env` file based on `.env.example`:
    ```env
    GEMINI_API_KEY="YOUR_API_KEY"
    APP_URL="http://localhost:3000"
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.
