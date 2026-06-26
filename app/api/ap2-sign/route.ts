import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

let cachedPrivateKey: string | null = null;

function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  const sortedObj: any = {};
  Object.keys(obj).sort().forEach(key => {
    sortedObj[key] = obj[key];
  });
  return JSON.stringify(sortedObj);
}

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  if (payload === null || typeof payload !== "object") {
    return NextResponse.json({ error: "Payload must be a JSON object" }, { status: 400 });
  }

  const requiredFields = ["item", "quantity", "total", "maxPrice"];
  const missingFields = requiredFields.filter(field => payload[field] === undefined);
  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Load Private Key asynchronously with caching
    let privateKey = cachedPrivateKey;
    if (!privateKey) {
      const keyPath = path.join(process.cwd(), "private_key.pem");
      try {
        privateKey = await fs.promises.readFile(keyPath, "utf8");
        cachedPrivateKey = privateKey;
      } catch (fileErr: any) {
        return NextResponse.json({ error: "Private key file not found" }, { status: 500 });
      }
    }

    const header = { alg: "RS256", typ: "JWS" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    
    // Deterministic canonical payload string
    const canonicalPayload = canonicalizeJson(payload);
    const encodedPayload = Buffer.from(canonicalPayload).toString("base64url");
    
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${encodedHeader}.${encodedPayload}`);
    const signature = sign.sign(privateKey, "base64url");
    
    // Generate detached JWS
    const jws = `${encodedHeader}..${signature}`;
    
    return NextResponse.json({ jws });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

