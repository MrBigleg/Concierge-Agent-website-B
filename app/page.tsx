"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Eye,
  Gauge,
  MapPin,
  Menu,
  Navigation,
  RefreshCw,
  Send,
  Fingerprint,
  ChevronRight,
  ArrowRight,
  Lock,
  MessageSquare,
  Wrench,
  User,
  Shield,
  FileCode2,
  ListFilter,
  X,
  Sparkles,
  ExternalLink,
  Download,
  Gamepad2,
} from "lucide-react";

// --- Types ---
interface Message {
  role: "user" | "model";
  content: string;
  groundingLinks?: Array<{ title: string; url: string }>;
}

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{ text: string }>;
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

export default function TitanConcierge() {
  // Navigation tabs: 'dashboard' | 'alerts' | 'booking' | 'checkout' | 'chat'
  const [activeTab, setActiveTab] = useState<"dashboard" | "alerts" | "booking" | "checkout" | "chat">("dashboard");
  
  // Real-time Telemetry State
  const [telemetry, setTelemetry] = useState({
    oilPressure: 92, // PSI
    engineTemp: 98, // °C
    batteryVoltage: 13.8, // V
    rearLeftTemp: 115, // °C (Warning)
    rearLeftWear: 82, // % (Critical)
    rearLeftPSI: 22, // PSI (Critical)
    rearRightTemp: 84, // °C
    rearRightWear: 45, // %
    rearRightPSI: 28, // PSI
    frontLeftTemp: 38, // °C
    frontLeftWear: 12, // %
    frontLeftPSI: 35, // PSI
    frontRightTemp: 38, // °C
    frontRightWear: 12, // %
    frontRightPSI: 35, // PSI
  });

  // State controls
  const [selectedTire, setSelectedTire] = useState<"FL" | "FR" | "RL" | "RR" | null>("RL");
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string>("michelin_replacement");
  const [mcpSyncing, setMcpSyncing] = useState<boolean>(true);
  
  // A2A Negotiation Logs
  const [a2aLogs, setA2aLogs] = useState<Array<{ time: string; source: string; text: string; code?: any }>>([]);
  const [negotiationComplete, setNegotiationComplete] = useState<boolean>(false);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);

  // Fingerprint Checkout Press State
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "authorizing" | "success">("idle");
  const [ap2Signature, setAp2Signature] = useState<string>("");
  const [dispatchEta, setDispatchEta] = useState<number>(18); // 18 mins countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Chat Panel State
  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Welcome, Craig. I am your Titan Concierge Agent. I am monitoring your Aventador SVJ. Telemetry indicates a rear-left thermal anomaly (115°C, 22 PSI) near Hwy 201, Khon Kaen. Slick Mobile Dispatch is ready to deploy. How can I assist you with your logistics or route planning today?",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle URL action parameters (e.g. from the 3D tyre drift game)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      if (action === "replace-rear-left") {
        setTimeout(() => {
          setActiveTab("chat");
          setMessages([
            {
              role: "model",
              content: "Welcome, Craig. I am your Titan Concierge Agent. I am monitoring your Aventador SVJ. Telemetry indicates a rear-left thermal anomaly (115°C, 22 PSI) near Hwy 201, Khon Kaen. Slick Mobile Dispatch is ready to deploy. How can I assist you with your logistics or route planning today?",
            },
            {
              role: "user",
              content: "My Rear-Left tyre just blew out in the virtual test mule simulation! I need an immediate replacement booked.",
            },
            {
              role: "model",
              content: "Acknowledged, Craig. I have received the telemetry dump from your virtual test mule run. The Rear-Left tyre (Michelin Pilot Sport) suffered a critical wear blowout (0% tread). I have pre-selected the Rear-Left tire inside the Booking desk for you and set the service type to Michelin SmartWear replacement. Please tap the Booking tab above or say 'Proceed with Booking' to finalize scheduling.",
            }
          ]);
          setSelectedTire("RL");
          setBookingStep(1);
        }, 100);
      }
    }
  }, []);

  // Telemetry real-time simulator interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Slightly fluctuate parameters for realism
        const isRLLeaking = prev.rearLeftPSI > 20;
        return {
          ...prev,
          oilPressure: Math.min(100, Math.max(88, prev.oilPressure + (Math.random() - 0.5))),
          engineTemp: Math.min(105, Math.max(95, prev.engineTemp + (Math.random() - 0.5))),
          batteryVoltage: Number((13.7 + Math.random() * 0.2).toFixed(1)),
          // Slow leak simulator for RL tire
          rearLeftPSI: isRLLeaking ? prev.rearLeftPSI - 0.05 : 20,
          rearLeftTemp: Math.min(120, Math.max(110, prev.rearLeftTemp + (Math.random() - 0.5))),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sync MCP on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setMcpSyncing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Trigger simulated AP2 Payment
  const triggerAP2Payment = () => {
    setCheckoutStatus("authorizing");
    
    setTimeout(() => {
      const generatedSignature = "sig_ap2_sha256_" + Math.random().toString(16).substring(2, 18) + "_authorized";
      setAp2Signature(generatedSignature);
      setCheckoutStatus("success");
      
      // Update local telemetry to show new tire replaced after a brief interval!
      setTimeout(() => {
        setTelemetry((prev) => ({
          ...prev,
          rearLeftPSI: 35,
          rearLeftTemp: 40,
          rearLeftWear: 0, // Brand new tire!
        }));
        setSelectedTire("RL");
      }, 10000); // 10 seconds simulation update
    }, 2500);
  };

  // Trigger simulated JSON-to-PDF Report Download
  const downloadMaintenanceReport = () => {
    const dateStr = new Date().toLocaleString();
    const activeAlerts = [];
    if (telemetry.rearLeftWear > 50) {
      activeAlerts.push({
        id: "AL-RL-01",
        component: "REAR-LEFT TIRE",
        severity: "CRITICAL",
        details: `Tread depth critical (${(1.2 + (100 - telemetry.rearLeftWear) * 0.026).toFixed(1)}mm / ${telemetry.rearLeftWear}% wear). Internal temperature over limit (${telemetry.rearLeftTemp.toFixed(1)}°C). Pressure drop active (${telemetry.rearLeftPSI.toFixed(1)} PSI).`,
        recommendation: "Immediate Michelin Cup 2 R replacement recommended."
      });
    }

    const reportContent = `================================================================================
                       TITAN CONCIERGE AUTONOMOUS LOGISTICS
                            VEHICLE DIAGNOSTIC REPORT
================================================================================

[GENERATION DATE]: ${dateStr}
[VEHICLE IDENTIFIER]: LAMBORGHINI AVENTADOR SVJ
[OWNER PROFILE]: Craig (craig@ctbmarketing.com)
[GEOLOCATION]: Isan Province, Highway 201 Segment, Khon Kaen, Thailand
[COORDINATES]: 16.4386° N, 102.8287° E
[PROTOCOL SECURE SHA]: SHA-256 (AP2-M2M-TUNNEL-ACTIVE)

--------------------------------------------------------------------------------
1. CURRENT VEHICLE TELEMETRY STATUS
--------------------------------------------------------------------------------
  * Oil Pressure:       ${telemetry.oilPressure.toFixed(1)} PSI (Nominal)
  * Engine Temperature:  ${telemetry.engineTemp.toFixed(1)} °C (Nominal)
  * Battery Voltage:     ${telemetry.batteryVoltage} V (Nominal)

  * WHEEL TELEMETRY DATA:
    - FRONT LEFT:   ${telemetry.frontLeftPSI.toFixed(1)} PSI | ${telemetry.frontLeftTemp.toFixed(1)} °C | Wear: ${telemetry.frontLeftWear}%
    - FRONT RIGHT:  ${telemetry.frontRightPSI.toFixed(1)} PSI | ${telemetry.frontRightTemp.toFixed(1)} °C | Wear: ${telemetry.frontRightWear}%
    - REAR LEFT:    ${telemetry.rearLeftPSI.toFixed(1)} PSI | ${telemetry.rearLeftTemp.toFixed(1)} °C | Wear: ${telemetry.rearLeftWear}% ${telemetry.rearLeftWear > 50 ? "[CRITICAL ALERT]" : ""}
    - REAR RIGHT:   ${telemetry.rearRightPSI.toFixed(1)} PSI | ${telemetry.rearRightTemp.toFixed(1)} °C | Wear: ${telemetry.rearRightWear}%

--------------------------------------------------------------------------------
2. ACTIVE MAINTENANCE ALERTS
--------------------------------------------------------------------------------
${activeAlerts.length > 0 ? activeAlerts.map(alert => `  * [ALERT ${alert.id}] - Component: ${alert.component}
    Severity:       ${alert.severity}
    Detailed Diagnostic: ${alert.details}
    Recommendation:      ${alert.recommendation}
`).join("\n") : "  * No active critical alerts. All tire and engine telemetry are within nominal safety envelopes."}

--------------------------------------------------------------------------------
3. AUTONOMOUS PROTOCOLS & DELEGATION (A2A & AP2)
--------------------------------------------------------------------------------
  * MCP Sync Status:     ACTIVE (Synced to Michelin SmartWear v2.4 API)
  * A2A Negotiation:     ${negotiationComplete ? "COMPLETED" : "IN PROGRESS"}
  * Selected Vendor:     Slick Mobile Fitting (Bay 04 Dispatch)
  * Item Dispatched:     Michelin Pilot Sport Cup 2 R - 245/35 ZR20 (95Y) XL
  * Negotiated Pricing:  ฿205,000 (Authorized autonomously within spending limit)
  * Spending Guardrail:  ฿250,000 Max Allowed
  * Transaction Status:  ${checkoutStatus === "success" ? "PAID & DEPLOYED" : "AWAITING BIOMETRIC FINGERPRINT AUTHORIZATION"}
  * AP2 Signature:       ${ap2Signature || "PENDING_SECURE_HOLD_TO_CONFIRM"}
  * Mobile Dispatch ETA: ${checkoutStatus === "success" ? `${dispatchEta} Minutes` : "On Standby"}

================================================================================
              END OF DIAGNOSTIC DATA REPORT • SECURED BY TITAN CONCIERGE
================================================================================`;

    const blob = new Blob([reportContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "titan_maintenance_report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fingerprint Scanner holding progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && checkoutStatus === "idle") {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            triggerAP2Payment();
            return 100;
          }
          return prev + 4;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isHolding, checkoutStatus]);

  // ETA countdown timer
  useEffect(() => {
    if (checkoutStatus === "success") {
      const countdown = setInterval(() => {
        setDispatchEta((prev) => (prev > 1 ? prev - 1 : 18));
      }, 60000); // decrement every minute
      return () => clearInterval(countdown);
    }
  }, [checkoutStatus]);

  // Trigger simulated A2A Negotiation
  const startA2ANegotiation = () => {
    setIsNegotiating(true);
    setA2aLogs([]);
    setNegotiationComplete(false);

    const steps = [
      {
        source: "MCP / Michelin SmartWear",
        text: "Analyzing RL SmartWear sensor arrays. Tread: 2.1mm (Millimeter threshold alert). Thermal Alert: 115°C, Pressure: 22 PSI. Flagging replacement required.",
        code: { telemetry: { RL: { wear: "8.2mm -> 2.1mm", state: "CRITICAL_ANOMALY" } } },
        delay: 500,
      },
      {
        source: "A2A Discovery",
        text: "Querying storefront Website A (https://slick-tires-storefront.example.com) for Michelin Cup 2 R availability.",
        code: { jsonrpc: "2.0", method: "discover_agent_card", params: { product: "Michelin Cup 2 R", size: "355/25 ZR21" }, id: 1 },
        delay: 1500,
      },
      {
        source: "Slick Storefront Agent",
        text: "Agent Card retrieved. 2 units found in regional hub (Nakhon Ratchasima). 1 Unit held for reservation code: SVJ-TITAN-009.",
        code: { jsonrpc: "2.0", result: { status: "RESERVED", stock: 2, price_thb: 180000, hold_expires: "30m" }, id: 1 },
        delay: 2800,
      },
      {
        source: "A2A Routing & Logistics",
        text: "Initiating slot negotiation with 'Slick Mobile Fitters' (Khon Kaen Dispatch Hub) to coordinates: 16.4386° N, 102.8287° E.",
        code: { jsonrpc: "2.0", method: "negotiate_fitting", params: { service_type: "Immediate_Dispatch", location: "Hwy 201, Khon Kaen" }, id: 2 },
        delay: 4200,
      },
      {
        source: "Slick Dispatch Agent",
        text: "Dispatch confirmed. Mobile Service Unit 4 allocated. Immediate dispatch scheduled. Logistics surcharge: ฿25,000.",
        code: { jsonrpc: "2.0", result: { status: "SCHEDULED", vehicle_id: "SLICK-MOBILE-4", estimated_dispatch_mins: 18, base_price_thb: 25000 }, id: 2 },
        delay: 5600,
      },
      {
        source: "Titan Concierge Agent",
        text: "All A2A logistical options aligned. Compiled dispatch invoice totaling ฿205,000. Ready for secure AP2 checkout authorization.",
        code: { invoice: { tire_cost: 180000, dispatch_cost: 25000, total: 205000, currency: "THB" } },
        delay: 7000,
      },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setA2aLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            source: step.source,
            text: step.text,
            code: step.code,
          },
        ]);
        if (index === steps.length - 1) {
          setIsNegotiating(false);
          setNegotiationComplete(true);
        }
      }, step.delay);
    });
  };

  // Talk to Gemini server-side endpoint with Google Maps Grounding
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput("");
    
    // Add user message to state
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userText },
          ],
          latLng: { latitude: 16.4386, longitude: 102.8287 },
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `[Error: ${data.error}] ${data.details || "Check your API keys in Settings > Secrets."}`,
          },
        ]);
      } else {
        // Extract grounding chunks maps links if any
        const groundingLinks: Array<{ title: string; url: string }> = [];
        if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
          data.groundingChunks.forEach((chunk: GroundingChunk) => {
            if (chunk.maps?.uri) {
              groundingLinks.push({
                title: chunk.maps.title || "Google Maps Place Link",
                url: chunk.maps.uri,
              });
            } else if (chunk.web?.uri) {
              groundingLinks.push({
                title: chunk.web.title || "Web Resource",
                url: chunk.web.uri,
              });
            }
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: data.text,
            groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "I encountered an error connecting to the concierge service. Please ensure your dev server is fully active and the Gemini API key is configured.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main id="titan-app" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Luxury Header */}
      <header id="header-bar" className="border-b border-white/10 bg-[#0A0A0A] sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-serif italic tracking-tighter text-amber-500">TITAN</span>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-medium">Concierge Autonomous System</span>
          </div>
        </div>

        {/* Real-Time Connectivity Badges */}
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Vehicle State</span>
            <span className="text-xs font-semibold tracking-wider">LAMBORGHINI AVENTADOR SVJ</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#D4AF37] animate-pulse"></div>
          </div>
          <a
            href="/titan_track_drift.html"
            className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>3D Tyre Game</span>
          </a>
          <button 
            onClick={() => setActiveTab("chat")} 
            className="flex items-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <section className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Display (Telemetry & Lamborghini Visualization) */}
        <div id="telemetry-panel" className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main Display Box */}
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col min-h-[500px]">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Top Stat Meters */}
            <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
              <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl flex items-center space-x-3">
                <Gauge className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">OIL PRESSURE</p>
                  <p className="font-mono text-xl font-bold text-neutral-100">{telemetry.oilPressure.toFixed(0)} <span className="text-xs text-amber-500 font-sans font-normal">PSI</span></p>
                </div>
              </div>
              <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl flex items-center space-x-3">
                <Activity className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">ENGINE TEMP</p>
                  <p className="font-mono text-xl font-bold text-neutral-100">{telemetry.engineTemp.toFixed(0)} <span className="text-xs text-amber-500 font-sans font-normal">°C</span></p>
                </div>
              </div>
              <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">BATTERY</p>
                  <p className="font-mono text-xl font-bold text-neutral-100">{telemetry.batteryVoltage.toFixed(1)} <span className="text-xs text-amber-500 font-sans font-normal">V</span></p>
                </div>
              </div>
            </div>

            {/* Simulated 3D Lamborghini Wireframe Widget (MCP App) */}
            <div className="flex-1 flex flex-col justify-center items-center relative py-6">
              
              {/* Wireframe car outline container */}
              <div className="relative w-72 h-96 flex items-center justify-center">
                
                {/* Simulated 3D car projection SVG */}
                <svg className="w-full h-full opacity-60 text-cyan-500/20" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer shadow / car glow */}
                  <path d="M40,80 L160,80 L170,120 L170,300 L150,350 L50,350 L30,300 L30,120 Z" fill="url(#carGlow)" opacity="0.15" />
                  
                  {/* Main Silhouette chassis */}
                  <path d="M60,40 C75,25 125,25 140,40 C145,50 155,90 162,110 C168,130 172,170 172,210 C172,250 168,280 164,300 C155,340 145,360 135,372 C115,385 85,385 65,372 C55,360 45,340 36,300 C32,280 28,250 28,210 C28,170 32,130 38,110 C45,90 55,50 60,40 Z" stroke="#164e63" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Fine structural lines */}
                  <path d="M100,25 L100,380" stroke="#0891b2" strokeWidth="0.5" opacity="0.3" />
                  <path d="M60,40 L140,40" stroke="#0891b2" strokeWidth="0.8" opacity="0.4" />
                  <path d="M38,110 L162,110" stroke="#0891b2" strokeWidth="0.8" opacity="0.4" />
                  <path d="M28,210 L172,210" stroke="#0891b2" strokeWidth="0.8" opacity="0.4" />
                  <path d="M36,300 L164,300" stroke="#0891b2" strokeWidth="0.8" opacity="0.4" />
                  
                  {/* Cockpit canopy */}
                  <path d="M70,120 C85,90 115,90 130,120 C138,140 142,180 142,210 C142,240 138,270 130,285 C115,305 85,305 70,285 C62,270 58,240 58,210 C58,180 62,140 70,120 Z" stroke="#0891b2" strokeWidth="1.2" />
                  <path d="M80,140 L120,140" stroke="#0891b2" strokeWidth="1" opacity="0.5" />
                  <path d="M75,250 C85,260 115,260 125,250" stroke="#0891b2" strokeWidth="1" opacity="0.5" />

                  {/* Spoiler outline */}
                  <path d="M30,345 L170,345" stroke="#0e7490" strokeWidth="2" />
                  <path d="M30,345 L35,360 M170,345 L165,360" stroke="#0e7490" strokeWidth="1.5" />

                  {/* Definitions */}
                  <defs>
                    <radialGradient id="carGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                </svg>

                {/* --- Interactive Tire Hotspots (A2UI Interactive Overlay) --- */}
                
                {/* FRONT LEFT TIRE */}
                <button
                  onClick={() => setSelectedTire("FL")}
                  className={`absolute top-[65px] left-[15px] group z-20 flex items-center justify-center`}
                  title="Front Left Tire"
                >
                  <span className="absolute w-8 h-12 bg-neutral-950/80 border border-neutral-800 rounded flex items-center justify-center overflow-hidden">
                    <span className="w-full h-full bg-emerald-500/5 animate-pulse absolute"></span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400">FL</span>
                  </span>
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-neutral-950"></span>
                  </span>
                </button>

                {/* FRONT RIGHT TIRE */}
                <button
                  onClick={() => setSelectedTire("FR")}
                  className="absolute top-[65px] right-[15px] group z-20 flex items-center justify-center"
                  title="Front Right Tire"
                >
                  <span className="absolute w-8 h-12 bg-neutral-950/80 border border-neutral-800 rounded flex items-center justify-center overflow-hidden">
                    <span className="w-full h-full bg-emerald-500/5 animate-pulse absolute"></span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400">FR</span>
                  </span>
                  <span className="absolute -top-1.5 -left-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-neutral-950"></span>
                  </span>
                </button>

                {/* REAR RIGHT TIRE */}
                <button
                  onClick={() => setSelectedTire("RR")}
                  className="absolute bottom-[80px] right-[15px] group z-20 flex items-center justify-center"
                  title="Rear Right Tire"
                >
                  <span className="absolute w-10 h-14 bg-neutral-950/80 border border-neutral-800 rounded flex items-center justify-center overflow-hidden">
                    <span className="w-full h-full bg-amber-500/10 absolute"></span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">RR</span>
                  </span>
                  <span className="absolute -top-1.5 -left-1.5 flex h-3.5 w-3.5">
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-neutral-950 animate-pulse"></span>
                  </span>
                </button>

                {/* REAR LEFT TIRE - CRITICAL FLAG */}
                <button
                  onClick={() => setSelectedTire("RL")}
                  className="absolute bottom-[80px] left-[15px] group z-20 flex items-center justify-center"
                  title="Rear Left Tire - CRITICAL"
                >
                  <span className={`absolute w-10 h-14 bg-neutral-950/90 border-2 ${telemetry.rearLeftWear > 50 ? 'border-red-500/60' : 'border-emerald-500/60'} rounded flex items-center justify-center overflow-hidden transition-all duration-300`}>
                    <span className={`w-full h-full ${telemetry.rearLeftWear > 50 ? 'bg-red-500/20 animate-pulse' : 'bg-emerald-500/10'} absolute`}></span>
                    <span className={`text-[10px] font-mono font-bold ${telemetry.rearLeftWear > 50 ? 'text-red-400' : 'text-emerald-400'}`}>RL</span>
                  </span>
                  
                  {telemetry.rearLeftWear > 50 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border border-neutral-950"></span>
                    </span>
                  )}
                </button>

                {/* Warning: Heat Popup Overlay */}
                {selectedTire === "RL" && telemetry.rearLeftWear > 50 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-[160px] left-1/2 -translate-x-1/2 w-48 bg-neutral-950/90 border border-red-500/40 p-3 rounded-xl z-30 shadow-2xl backdrop-blur"
                  >
                    <div className="flex items-center space-x-1 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider">WARNING: HEAT</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
                        <p className="text-[8px] text-neutral-400 font-mono">Tire Temp</p>
                        <p className="text-sm font-mono font-bold text-red-200">{telemetry.rearLeftTemp.toFixed(0)}°</p>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
                        <p className="text-[8px] text-neutral-400 font-mono">Wear Rate</p>
                        <p className="text-sm font-mono font-bold text-red-200">{telemetry.rearLeftWear}%</p>
                      </div>
                    </div>
                    <div className="mt-1.5 text-center">
                      <p className="text-[8px] font-mono text-red-400/80">Press RL: {telemetry.rearLeftPSI.toFixed(1)} PSI</p>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Selected Tire Detail Card */}
            <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedTire === "FL" || selectedTire === "FR" ? "bg-emerald-500" :
                    selectedTire === "RR" ? "bg-amber-500" : "bg-red-500 animate-pulse"
                  }`}></span>
                  <h4 className="text-xs font-mono font-bold text-neutral-200 uppercase">
                    {selectedTire === "FL" && "Front-Left Tire Analysis"}
                    {selectedTire === "FR" && "Front-Right Tire Analysis"}
                    {selectedTire === "RL" && "Rear-Left Tire Analysis (Critical)"}
                    {selectedTire === "RR" && "Rear-Right Tire Analysis"}
                  </h4>
                </div>
                <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider">Michelin SmartWear Real-time</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/50">
                  <p className="text-[8px] text-neutral-400 font-mono">PRESSURE</p>
                  <p className="text-base font-mono font-bold text-neutral-100">
                    {selectedTire === "FL" && telemetry.frontLeftPSI}
                    {selectedTire === "FR" && telemetry.frontRightPSI}
                    {selectedTire === "RL" && telemetry.rearLeftPSI.toFixed(1)}
                    {selectedTire === "RR" && telemetry.rearRightPSI}
                    <span className="text-[10px] text-neutral-400 font-normal ml-0.5">PSI</span>
                  </p>
                </div>
                <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/50">
                  <p className="text-[8px] text-neutral-400 font-mono">TEMPERATURE</p>
                  <p className="text-base font-mono font-bold text-neutral-100">
                    {selectedTire === "FL" && telemetry.frontLeftTemp}
                    {selectedTire === "FR" && telemetry.frontRightTemp}
                    {selectedTire === "RL" && telemetry.rearLeftTemp.toFixed(0)}
                    {selectedTire === "RR" && telemetry.rearRightTemp}
                    <span className="text-[10px] text-neutral-400 font-normal ml-0.5">°C</span>
                  </p>
                </div>
                <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/50">
                  <p className="text-[8px] text-neutral-400 font-mono">TREAD WEAR</p>
                  <p className="text-base font-mono font-bold text-neutral-100">
                    {selectedTire === "FL" && telemetry.frontLeftWear}
                    {selectedTire === "FR" && telemetry.frontRightWear}
                    {selectedTire === "RL" && telemetry.rearLeftWear}
                    {selectedTire === "RR" && telemetry.rearRightWear}
                    <span className="text-[10px] text-neutral-400 font-normal ml-0.5">%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Alert Overlay (Replicating action banner on first screen) */}
            {telemetry.rearLeftWear > 50 && activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setActiveTab("alerts");
                  setSelectedTire("RL");
                }}
                className="mt-4 bg-gradient-to-r from-red-950/60 via-amber-950/30 to-neutral-900/40 border border-red-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-red-500/40 transition-all group"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="flex h-3.5 w-3.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                  <div>
                    <h5 className="font-serif text-sm uppercase tracking-wider font-bold text-red-200">ACTION REQUIRED</h5>
                    <p className="text-xs text-neutral-400">Rear-Left Thermal Anomaly Detected near Khon Kaen</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )}

          </div>

          {/* Location / Destination Overview Panel */}
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">CURRENT LOGISTICS STAGE</span>
                <h4 className="text-sm font-semibold text-neutral-200">Isan Province • Hwy 201 Route Segment</h4>
                <p className="text-xs text-neutral-400 font-mono">16.4386° N, 102.8287° E • Khon Kaen, Thailand</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-[9px] text-neutral-400 font-mono uppercase">COURIER DISPATCH</p>
                <p className="text-xs font-mono font-semibold text-neutral-200">Slick Fitters Bay 4</p>
                <p className="text-[10px] text-emerald-400 font-mono">ETA: {checkoutStatus === "success" ? `${dispatchEta}m` : "On Standby"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
                {checkoutStatus === "success" ? `${dispatchEta}m` : "--"}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Tabbed Interface (Alerts, Booking, Checkout, AI Chat) */}
        <div id="action-panel" className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Navigation Controls (Horizontal pill selector) */}
          <div id="tabs-navigation" className="bg-neutral-900 p-1.5 rounded-xl flex items-center space-x-1 border border-neutral-800/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "dashboard" ? "bg-amber-500 text-neutral-950 shadow" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              System
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all relative ${
                activeTab === "alerts" ? "bg-amber-500 text-neutral-950 shadow" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Alerts
              {telemetry.rearLeftWear > 50 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "booking" ? "bg-amber-500 text-neutral-950 shadow" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => setActiveTab("checkout")}
              className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "checkout" ? "bg-amber-500 text-neutral-950 shadow" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Pay AP2
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "chat" ? "bg-amber-500 text-neutral-950 shadow" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Chat
            </button>
          </div>

          {/* Active Card Container */}
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[450px]">
            
            <AnimatePresence mode="wait">
              
              {/* --- DASHBOARD TAB --- */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 flex flex-col space-y-4 flex-1 justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-amber-500" />
                      <h3 className="font-serif text-base tracking-wider uppercase font-extrabold text-neutral-200">Titan Concierge Core</h3>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      This autonomous concierge operates over A2UI and MCP protocols, tracking Michelin SmartWear tire sensor telemetry, and dispatching fitting vans automatically.
                    </p>

                    <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-900 pb-2">
                        <span className="text-neutral-400">MCP Status:</span>
                        <span className="text-emerald-400 font-bold">ACTIVE & SYNCED</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-900 pb-2">
                        <span className="text-neutral-400">A2A Negotiation:</span>
                        <span className={negotiationComplete ? "text-emerald-400 font-bold" : "text-amber-500 animate-pulse"}>
                          {negotiationComplete ? "READY (WEBSITE A)" : "AWAITING DEPLOYMENT"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-400">AP2 Spending Guard:</span>
                        <span className="text-amber-400 font-bold">฿250,000 MAX APPROVED</span>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                      <h4 className="text-xs font-semibold text-amber-400 mb-1">Pre-emptive Tire Logistics</h4>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Michelin&apos;s predictive Wear Algorithm flags the Rear-Left tire as approaching sub-millimeter thread limit. Automated booking is queued.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-amber-500/5 to-cyan-500/5 border border-amber-500/10 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <Gamepad2 className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-semibold text-amber-400">Titan Track Drift Simulator</h4>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">
                          Test your drifting reflexes under extreme tire degradation on Highway 201 in our high-fidelity virtual tire lab. Keep tread levels optimal!
                        </p>
                      </div>
                      <a
                        href="/titan_track_drift.html"
                        className="bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all w-full text-center"
                      >
                        <span>Launch 3D Game</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => {
                        setActiveTab("alerts");
                        setSelectedTire("RL");
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-950 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <span>Inspect Alerts</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadMaintenanceReport}
                      className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-500" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* --- PROACTIVE ALERTS VIEW (Screen 2) --- */}
              {activeTab === "alerts" && (
                <motion.div
                  key="alerts-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 flex flex-col space-y-4 flex-1 justify-between overflow-y-auto"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h3 className="font-serif text-base tracking-wider uppercase font-bold text-neutral-200">Proactive Alerts</h3>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        3 Events
                      </span>
                    </div>

                    {/* Alert Card 1: Critical (Michelin SmartWear) */}
                    <div className="bg-neutral-950/60 border border-red-500/30 p-4 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">
                          CRITICAL • JUST NOW
                        </span>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-200">Rear-Left Tire Pressure Drop</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 mb-3">Michelin SmartWear flags critical tread loss and pressure deviation near Khon Kaen.</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/50">
                        <div>
                          <p className="text-[9px] text-neutral-400 font-mono">Current PSI</p>
                          <p className="text-xs font-mono font-bold text-amber-500">{telemetry.rearLeftPSI.toFixed(1)} / 35</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-neutral-400 font-mono">Tire Temp</p>
                          <p className="text-xs font-mono font-bold text-red-400">{telemetry.rearLeftTemp.toFixed(0)}°C</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("booking");
                          setSelectedService("michelin_replacement");
                          startA2ANegotiation();
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-all"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>SUMMON CONCIERGE</span>
                      </button>
                    </div>

                    {/* Alert Card 2: Warning Hazard */}
                    <div className="bg-neutral-950/60 border border-amber-500/20 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                          WARNING • 2KM AHEAD
                        </span>
                        <Navigation className="w-4 h-4 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-200">Hazard Detected: Highway 201</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 mb-3">Road debris and micro-congestion reported in Isan segment. Automated bypass mapping computed.</p>
                      
                      {/* Dark Map Representation */}
                      <div className="h-24 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                        {/* Simulated route line */}
                        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 20,80 Q 80,20 140,80 T 260,30" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 4" />
                          <path d="M 20,80 Q 70,60 130,50 T 260,30" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                          <circle cx="130" cy="50" r="4" fill="#f59e0b" className="animate-ping" />
                          <circle cx="130" cy="50" r="3" fill="#f59e0b" />
                        </svg>
                        <div className="absolute bottom-2 left-2 bg-neutral-950/90 border border-red-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono text-red-400">
                          ▲ Rerouting Advised
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("chat");
                          setMessages((prev) => [
                            ...prev,
                            { role: "user", content: "Show me the bypass road to avoid the Highway 201 construction and suggest a safe route." }
                          ]);
                          // Auto trigger message
                          setTimeout(() => {
                            setChatInput("Show me the bypass road to avoid the Highway 201 construction and suggest a safe route.");
                            sendChatMessage();
                          }, 100);
                        }}
                        className="w-full mt-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-500" />
                        <span>REVIEW ROUTE</span>
                      </button>
                    </div>

                    {/* Alert Card 3: Notice */}
                    <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-neutral-700"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-extrabold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded uppercase">
                          NOTICE • IN 500KM
                        </span>
                        <Activity className="w-4 h-4 text-neutral-400" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-200">Routine Aero Calibration</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 mb-3">Active aerodynamics systems require scheduled recalibration for optimal high-speed stability.</p>
                      
                      <button className="w-full bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800/80 text-neutral-300 py-2 rounded-lg text-xs font-semibold uppercase transition-all">
                        SCHEDULE
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* --- BOOKING & A2A NEGOTIATION VIEW (Screen 3) --- */}
              {activeTab === "booking" && (
                <motion.div
                  key="booking-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 flex flex-col space-y-4 flex-1 justify-between overflow-y-auto"
                >
                  <div className="space-y-4">
                    {/* Booking Header & Progress */}
                    <div className="border-b border-neutral-900 pb-3">
                      <h3 className="font-serif text-base tracking-wider uppercase font-bold text-neutral-200">SERVICE BOOKING</h3>
                      
                      {/* Step Progress Bar */}
                      <div className="flex items-center justify-between mt-3 font-mono text-[9px]">
                        <div className="flex items-center space-x-1 text-amber-400">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">1</span>
                          <span>SERVICE</span>
                        </div>
                        <div className="w-8 h-[1px] bg-neutral-800"></div>
                        <div className="flex items-center space-x-1 text-neutral-400">
                          <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center">2</span>
                          <span>LOCATION</span>
                        </div>
                        <div className="w-8 h-[1px] bg-neutral-800"></div>
                        <div className="flex items-center space-x-1 text-neutral-400">
                          <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center">3</span>
                          <span>TIME</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-serif tracking-wider text-amber-500 uppercase">SELECT SERVICE</h4>

                    {/* Services Radio List */}
                    <div className="space-y-2.5">
                      <div 
                        onClick={() => setSelectedService("michelin_replacement")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedService === "michelin_replacement" 
                            ? "bg-neutral-950 border-amber-500/40" 
                            : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-neutral-200">MICHELIN CUP 2 R REPLACEMENT</span>
                          <span className="w-4 h-4 rounded-full border border-amber-500/50 flex items-center justify-center">
                            {selectedService === "michelin_replacement" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-normal">Immediate deployment. Full set replacement & dynamic balancing.</p>
                      </div>

                      <div 
                        onClick={() => setSelectedService("aero_calibration")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedService === "aero_calibration" 
                            ? "bg-neutral-950 border-amber-500/40" 
                            : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-neutral-200">AERO CALIBRATION</span>
                          <span className="w-4 h-4 rounded-full border border-neutral-800 flex items-center justify-center">
                            {selectedService === "aero_calibration" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-normal">On-site telemetry check and active aerodynamic recalibration.</p>
                      </div>

                      <div 
                        onClick={() => setSelectedService("mobile_detailing")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedService === "mobile_detailing" 
                            ? "bg-neutral-950 border-amber-500/40" 
                            : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-neutral-200">MOBILE DETAILING</span>
                          <span className="w-4 h-4 rounded-full border border-neutral-800 flex items-center justify-center">
                            {selectedService === "mobile_detailing" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-normal">Premium exterior wash and interior conditioning.</p>
                      </div>
                    </div>

                    {/* Dispatch Location View Map representation */}
                    <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                      <p className="text-[10px] font-serif uppercase text-amber-500 tracking-wider mb-2">DISPATCH LOCATION</p>
                      
                      {/* Simulated map */}
                      <div className="h-24 bg-neutral-900 rounded-lg border border-neutral-800/80 flex items-center justify-center relative overflow-hidden mb-2">
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeWidth="4" />
                          <line x1="120" y1="0" x2="120" y2="100" stroke="#334155" strokeWidth="2" />
                          <circle cx="120" cy="50" r="6" fill="#f59e0b" className="animate-ping" />
                          <circle cx="120" cy="50" r="4" fill="#f59e0b" />
                        </svg>
                        <div className="absolute top-2 right-2 bg-neutral-950/80 border border-neutral-800 px-1.5 py-0.5 rounded text-[8px] font-mono text-neutral-400">
                          Hwy 201 Segment
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 font-mono text-xs text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hwy 201, Khon Kaen</span>
                      </div>
                    </div>

                    {/* A2A Agent-to-Agent Live Negotiation Output */}
                    <div className="bg-neutral-950/90 border border-neutral-800 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between mb-2 border-b border-neutral-900 pb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[9px] font-mono font-bold text-neutral-300">A2A LOGS (RPC SESSION)</span>
                        </div>
                        {isNegotiating && (
                          <span className="text-[8px] font-mono text-amber-500 animate-pulse flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            Negotiating...
                          </span>
                        )}
                      </div>

                      <div className="h-40 overflow-y-auto text-[9.5px] font-mono space-y-2.5 scrollbar-thin scrollbar-thumb-neutral-800">
                        {a2aLogs.length === 0 ? (
                          <div className="text-neutral-500 flex flex-col items-center justify-center h-full py-4 text-center">
                            <Cpu className="w-6 h-6 mb-1 opacity-40 text-amber-400" />
                            <p>Press &apos;CONTINUE&apos; to negotiate</p>
                            <p className="text-[8px] text-neutral-600">Autonomously interrogates storefront storefronts</p>
                          </div>
                        ) : (
                          a2aLogs.map((log, idx) => (
                            <div key={idx} className="border-l border-neutral-800 pl-2 py-0.5">
                              <div className="flex justify-between text-neutral-400 font-bold">
                                <span>[{log.source}]</span>
                                <span className="text-[8px] font-normal">{log.time}</span>
                              </div>
                              <p className="text-neutral-300 mt-0.5">{log.text}</p>
                              {log.code && (
                                <pre className="bg-neutral-900/80 p-1.5 rounded mt-1 overflow-x-auto text-amber-400/90 border border-neutral-800/40 text-[8.5px]">
                                  {JSON.stringify(log.code, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => {
                      if (a2aLogs.length === 0) {
                        startA2ANegotiation();
                      } else if (negotiationComplete) {
                        setActiveTab("checkout");
                      }
                    }}
                    disabled={isNegotiating}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all mt-4"
                  >
                    <span>
                      {isNegotiating ? "Negotiating Options..." :
                       a2aLogs.length === 0 ? "START LOGISTICAL NEGOTIATION" : "CONTINUE TO CHECKOUT ->"}
                    </span>
                  </button>
                </motion.div>
              )}

              {/* --- SECURE CHECKOUT VIEW (Screen 4) --- */}
              {activeTab === "checkout" && (
                <motion.div
                  key="checkout-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 flex flex-col space-y-4 flex-1 justify-between overflow-y-auto"
                >
                  <div className="space-y-4">
                    <div className="border-b border-neutral-900 pb-3">
                      <h3 className="font-serif text-base tracking-wider uppercase font-bold text-neutral-200">SECURE CHECKOUT</h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">AP2 (Agent Payments Protocol) Secure Authorization</p>
                    </div>

                    {/* Dispatch Invoice Summary Card */}
                    <div className="bg-neutral-950/60 border border-neutral-800 p-5 rounded-xl space-y-4 relative">
                      <span className="absolute top-3 right-3 text-[9px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        INVOICE #9022
                      </span>
                      
                      <div className="space-y-1">
                        <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">DISPATCH SUMMARY</span>
                        <h4 className="text-xs font-bold text-neutral-300">Michelin Cup 2 R SVJ Rear-Left Fitted Set</h4>
                        <p className="text-[10px] text-neutral-400 font-mono">Dispatched Courier: Slick Mobile bay 4</p>
                      </div>

                      <div className="border-t border-neutral-900 pt-3 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400">Michelin Cup 2 R Replacement:</span>
                          <span className="text-neutral-200">฿180,000</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400">Immediate Mobile Dispatch:</span>
                          <span className="text-neutral-200">฿25,000</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800 pt-3.5 flex items-baseline justify-between">
                        <span className="text-xs font-serif font-bold text-neutral-400">TOTAL AMOUNT</span>
                        <span className="text-2xl font-serif font-extrabold text-amber-500">฿205,000</span>
                      </div>
                    </div>

                    {/* Dynamic AP2 Checkout Status Outputs */}
                    {checkoutStatus === "authorizing" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-neutral-950/80 border border-amber-500/30 p-4 rounded-xl text-center space-y-2"
                      >
                        <RefreshCw className="w-6 h-6 mx-auto text-amber-400 animate-spin" />
                        <h5 className="text-xs font-mono font-bold text-amber-400 uppercase">AP2 CRYPTOGRAPHIC AUTHORIZATION</h5>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Querying user-established budget guardrails (฿250,000 cap). Digitally signing transaction payload...
                        </p>
                      </motion.div>
                    )}

                    {checkoutStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <h5 className="text-xs font-mono font-bold uppercase">AP2 BUDGET APPROVED & PAID</h5>
                        </div>
                        <p className="text-[10px] text-neutral-300 leading-normal">
                          Autonomous transaction cleared successfully. Receipts compiled and synced to central log.
                        </p>
                        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-900 font-mono text-[8px] text-neutral-400 space-y-1">
                          <p>TRANSACTION SIGNATURE:</p>
                          <p className="text-amber-500 select-all overflow-x-auto whitespace-pre">{ap2Signature}</p>
                          <p className="text-emerald-400 mt-1">STATUS: DISPATCH COMPLETE (18m ETA)</p>
                        </div>
                      </motion.div>
                    )}

                  </div>

                  {/* Fingerprint Scanner Area */}
                  {checkoutStatus === "idle" && (
                    <div className="mt-6 flex flex-col items-center space-y-3">
                      <p className="text-[10px] font-mono text-neutral-400">Press and hold to confirm dispatch</p>
                      
                      <button
                        onMouseDown={() => setIsHolding(true)}
                        onMouseUp={() => { setIsHolding(false); setHoldProgress(0); }}
                        onMouseLeave={() => { setIsHolding(false); setHoldProgress(0); }}
                        onTouchStart={() => setIsHolding(true)}
                        onTouchEnd={() => { setIsHolding(false); setHoldProgress(0); }}
                        className="relative w-16 h-16 rounded-full border border-amber-500/30 bg-neutral-950/60 flex items-center justify-center group cursor-pointer transition-all active:scale-95"
                      >
                        {/* Dynamic Progress circular border */}
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                          <circle
                            cx="32"
                            cy="32"
                            r="29"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 29}
                            strokeDashoffset={2 * Math.PI * 29 * (1 - holdProgress / 100)}
                            className="transition-all duration-75"
                          />
                        </svg>

                        <Fingerprint className={`w-8 h-8 text-amber-500 transition-all ${isHolding ? "scale-110 animate-pulse text-amber-400" : ""}`} />
                      </button>

                      <div className="h-1 text-center">
                        {isHolding && (
                          <p className="text-[8px] font-mono text-amber-400">Authorizing AP2: {holdProgress}%</p>
                        )}
                      </div>
                    </div>
                  )}

                  {checkoutStatus === "success" && (
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all mt-4"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>RETURN TO SYSTEM OVERVIEW</span>
                    </button>
                  )}
                </motion.div>
              )}

              {/* --- AI CONCIERGE CHAT TAB --- */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col justify-between overflow-hidden"
                >
                  {/* Chat Message Logs */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[350px] scrollbar-thin scrollbar-thumb-neutral-800">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col space-y-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center space-x-1.5 text-[9px] text-neutral-400 font-mono">
                          {msg.role === "user" ? (
                            <>
                              <span>CRAIG (OWNER)</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                              <span>TITAN CONCIERGE AGENT</span>
                            </>
                          )}
                        </div>

                        <div className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[90%] border ${
                          msg.role === "user"
                            ? "bg-amber-500/10 border-amber-500/20 text-neutral-100"
                            : "bg-neutral-950/80 border-neutral-800/80 text-neutral-300"
                        }`}>
                          <p>{msg.content}</p>

                          {/* Render Google Maps place links retrieved from groundingChunks if any */}
                          {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-neutral-800/60 space-y-1.5">
                              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Grounded Places (Google Maps):</p>
                              {msg.groundingLinks.map((link, lIdx) => (
                                <a
                                  key={lIdx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all"
                                >
                                  <span>{link.title}</span>
                                  <ExternalLink className="w-3 h-3 text-amber-500" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex flex-col items-start space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-[9px] text-neutral-400 font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                          <span>TITAN CONCIERGE AGENT</span>
                        </div>
                        <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl text-xs max-w-[80%] flex items-center space-x-2 text-neutral-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          <span>Consulting Satellite Maps...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick-Prompt Suggestions */}
                  <div className="px-5 py-2 border-t border-neutral-900 bg-neutral-950/40">
                    <p className="text-[8px] text-neutral-400 font-mono uppercase tracking-wider mb-1.5">Suggested Inquiries:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setChatInput("Where is the Slick mobile fitter now?")}
                        className="text-[9px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2 py-1 rounded"
                      >
                        Find Mobile Fitter
                      </button>
                      <button 
                        onClick={() => setChatInput("Check my rear-left tire pressure and temp.")}
                        className="text-[9px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2 py-1 rounded"
                      >
                        Check RL Telemetry
                      </button>
                      <button 
                        onClick={() => setChatInput("What coffee shops are nearby Highway 201 while I wait?")}
                        className="text-[9px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2 py-1 rounded"
                      >
                        Nearby Places
                      </button>
                    </div>
                  </div>

                  {/* Chat Input Bar */}
                  <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Instruct Concierge..."
                      className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs font-mono outline-none text-neutral-200 transition-all placeholder:text-neutral-500"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center text-neutral-950 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </section>

      {/* Real-time Telemetry Dashboard Sync Footer Status */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>A2UI Concierge Engine Live • Secured by AP2 Cryptography</span>
        </div>
        <div className="text-right">
          <span>Khon Kaen, Isan Province, TH • 2026</span>
        </div>
      </footer>

    </main>
  );
}
