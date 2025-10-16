import { NextRequest, NextResponse } from "next/server";

export function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // Allow requests from both www.hexapink.com and hexapink.com
  const allowedOrigins = [
    "https://www.hexapink.com",
    "https://hexapink.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");

  return response;
}

export function handleCors(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, request);
  }
  return null;
}
