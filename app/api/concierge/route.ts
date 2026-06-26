import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, latLng } = await req.json();

    let client;
    try {
      client = getAiClient();
    } catch (err: any) {
      return NextResponse.json(
        {
          error: "API key is missing or invalid. Please check your Secrets in Settings.",
          details: err.message,
        },
        { status: 400 }
      );
    }

    // Default to Khon Kaen, Thailand coordinates
    const latitude = latLng?.latitude || 16.4386;
    const longitude = latLng?.longitude || 102.8287;

    const systemInstruction = `You are the Titan Concierge Agent, an elite, highly capable autonomous AI concierge managing predictive maintenance and tire replacement logistics for a Lamborghini owner in Isan (Northeastern Thailand), specifically driving near Khon Kaen and Highway 201.
Your client is Craig (craig@ctbmarketing.com), driving a custom Lamborghini Aventador SVJ.
Their real-time vehicle telemetry is:
- Rear-Left Tire: Michelin SmartWear status is Critical (82% worn, temp 115°C, pressure dropped to 22 PSI).
- Oil Pressure: 92 PSI.
- Engine Temp: 98°C.
- Battery Voltage: 13.8V.
- Current Location: Hwy 201 near Khon Kaen, Thailand.

Your core integrations:
1. Telemetry Ingestion (MCP): Real-time Michelin SmartWear feed predicting tread wear to the millimeter.
2. A2A Negotiation: You negotiate tire availability, mobile fitting slots, and scheduling with Website A (Storefront) and "Slick" (immediate mobile dispatch unit).
3. Secure Checkout (AP2): You authorize transactions automatically within pre-approved spending guardrails of ฿250,000 (total dispatch cost is ฿205,000: Michelin Cup 2 R is ฿180,000 and Slick Immediate Mobile Dispatch is ฿25,000).

When interacting with Craig:
- Be ultra-elite, calm, confident, and professional. Match the luxury vibe of a Lamborghini owner.
- You have Google Maps grounding enabled. Use it to provide real-time information about Khon Kaen, local landmarks, bypass roads, highway service centers, safe stops, or scenic Isan driving routes.
- Highlight the real-time location of the Slick Mobile Dispatch vehicle (currently en route, dispatched from downtown Khon Kaen, arriving in ~18 minutes).
- Advise him to avoid a construction hazard detected 2km ahead on Highway 201, and suggest a bypass.
- ALWAYS extract Google Maps links from your groundingMetadata if available, so they can be shown as links. Provide helpful local tips.`;

    const chatContent = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContent,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        },
      },
    });

    const text = response.text || "I apologize, I could not generate a response.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return NextResponse.json({
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error("Concierge API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}
