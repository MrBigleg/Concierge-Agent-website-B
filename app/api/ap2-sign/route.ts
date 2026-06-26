import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Load Private Key
    const keyPath = path.join(process.cwd(), "private_key.pem");
    if (!fs.existsSync(keyPath)) {
      return NextResponse.json({ error: "Private key not found" }, { status: 500 });
    }
    const privateKey = fs.readFileSync(keyPath, "utf8");

    const header = { alg: "RS256", typ: "JWS" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    
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
