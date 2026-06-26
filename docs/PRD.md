# Product Requirement Document (PRD)
## Titan Concierge: Autonomous Predictive Maintenance & Tire Replacement Logistics

---

## 1. Executive Summary
**Titan Concierge** is an elite autonomous agent system designed to manage predictive maintenance and tire replacement logistics on behalf of its user. This project documents the reference system built for **Craig** (`craig@ctbmarketing.com`), driving a custom **Lamborghini Aventador SVJ** near Highway 201 in Khon Kaen (Isan region, Northeastern Thailand). 

By integrating Model Context Protocol (MCP) telemetry, Agent-to-Agent (A2A) negotiation, Secure Checkout (AP2), and Google Maps-grounded AI intelligence, Titan Concierge detects safety hazards pre-emptively and solves complex logistical problems autonomously without requiring complex manual steps.

---

## 2. Product Objectives & Target Audience
### 2.1 Target Audience
*   **User:** Craig (`craig@ctbmarketing.com`)
*   **Vehicle:** Lamborghini Aventador SVJ
*   **Vibe:** Luxury, ultra-elite, precise, clean, highly responsive.

### 2.2 Core Objectives
*   **Predictive Safety:** Ingest real-time Michelin SmartWear telemetry to identify thermal and tread wear anomalies before a failure happens.
*   **Frictionless Coordination:** Eliminate the user's need to find tires, contact shops, negotiate schedules, or make payments manually.
*   **Autonomous Commerce:** Establish secure machine-to-machine checkout within guardrails, authenticating transactions with high-grade biometrics (Fingerprint verification).

---

## 3. High-Level Architecture & Core Integrations

```
┌────────────────────────────────────────────────────────────────────────┐
│                              A2UI HOST                                 │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌──────────────┐   │
│  │   MCP TELEMETRY      │  │    A2A ENGINE       │  │  AP2 SECURE  │   │
│  │  SmartWear Ingestion │  │ Storefront Polling  │  │   PAYMENT    │   │
│  └──────────┬───────────┘  └──────────┬──────────┘  └──────┬───────┘   │
└─────────────┼─────────────────────────┼────────────────────┼───────────┘
              │                         │                    │
              ▼                         ▼                    ▼
      Michelin Sensors             Website A (Slick)     Hold-to-Authorize
      RL Wear: 82% Critical        Cup 2 R @ ฿180,000    Signature Created
      Hwy 201, Khon Kaen           Dispatch @ ฿25,000    Total: ฿205,000
```

### 3.1 Telemetry Ingestion (MCP)
*   **Data Feeds:**
    *   **Engine:** Oil Pressure (92 PSI), Engine Temp (98°C), Battery Voltage (13.8V).
    *   **Tyres (SmartWear):** 4-wheel monitoring. Rear-Left is flagged as **Critical** (82% worn, tread depth down to 2.1mm, 115°C temperature spike, and pressure dropped to 22 PSI).
*   **Logic:** Continuous simulation showing dynamic pressure loss on the Rear-Left tire for true real-time realism.

### 3.2 Agent-to-Agent (A2A) Negotiation
*   **Client Agent:** Titan Concierge Client.
*   **Server Agent (Website A - Storefront):** Slick Mobile Fitters.
*   **Negotiation Outcome:**
    *   Finds Michelin Cup 2 R stock in Nakhon Ratchasima regional hub.
    *   Holds item for reservation `SVJ-TITAN-009`.
    *   Books regional dispatch unit `SLICK-MOBILE-4` based in Khon Kaen.
    *   Agreed price structure: Michelin Cup 2 R is **฿180,000**, Immediate Mobile Dispatch is **฿25,000**. Total Invoice is **฿205,000**.

### 3.3 Secure Checkout (AP2)
*   **Spending Limit:** ฿250,000.
*   **Invoice Total:** ฿205,000 (Approved & authorized).
*   **Biometric Interface:** Interactive pressure-and-hold fingerprint terminal generating an encrypted signature `sig_ap2_sha256_...` upon success.
*   **Post-Payment Recovery:** Replaces the critical tire telemetry in real-time back to nominal parameters (Tread 0% worn, 35 PSI, 40°C) after checkout dispatch is finalized.

### 3.4 Gemini 3.5 Flash & Google Maps Grounding
*   **Endpoint:** `/api/concierge` server-side API route.
*   **Grounding Context:** Configured with real-time location vectors (Latitude: 16.4386, Longitude: 102.8287).
*   **Capabilities:** Chat bot provides real-time Isan routing, recommends bypasses around Highway 201 construction hazards, highlights Slick fitting van ETA progress, and extracts maps locations as links.

---

## 4. User Interface Specification
The application follows the **Sophisticated Dark** visual guidelines:
*   ** Obsidian Canvas:** Soft black backgrounds (`#050505`) and dark paneling (`#0A0A0A`) with fine, crisp golden highlights (`#D4AF37`) indicating high-end luxury.
*   **Typography:** Serif headings (*Cormorant Garamond* italicized) paired with crisp monospaced logs (*JetBrains Mono*) and standard UI controls (*Inter*).
*   **Interactive Hotspots:** Clickable tire anchors (FL, FR, RL, RR) showing real-time telemetry changes. Red alerting triggers warning overlays with smooth entering/exiting animations.
*   **Tabbed Quick Navigation:** Fast panels for System Overview, Proactive Alerts, Booking, Secure Payment, and Gemini AI Chat.

---

## 5. Security & Guardrails
*   **Spending Limits:** Enforce maximum machine-authorized spending limit of ฿250,000.
*   **Biometric Verification:** Manual finger authentication prevents unsolicited payments.
*   **Server-Side Execution:** Keep Gemini API keys secure inside server-side endpoints, hiding private credentials from the browser console.
