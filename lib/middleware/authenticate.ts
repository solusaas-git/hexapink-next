import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function authenticate(request: NextRequest) {
  try {
    let token = null;

    // First, try to get token from cookies
    token = request.cookies.get("accessToken")?.value;

    // If not in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    // Connect to database
    await connectDB();

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticate(request);
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  
  if (user.role !== "admin" && user.role !== "manager") {
    throw new Error("Forbidden - Admin access required");
  }
  
  return user;
}

