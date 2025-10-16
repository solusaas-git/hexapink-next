import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sanitizeBody } from "@/lib/middleware/sanitize";
import { addCorsHeaders, handleCors } from "@/lib/middleware/cors";

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = sanitizeBody(body);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      const response = NextResponse.json(
        { errorType: "USER_NOT_FOUND", message: "User does not exist." },
        { status: 400 }
      );
      return addCorsHeaders(response, request);
    }

    if (user.status === "Suspended") {
      const response = NextResponse.json(
        {
          errorType: "USER_SUSPENDED",
          message: "Your account has been suspended. Please contact support.",
        },
        { status: 403 }
      );
      return addCorsHeaders(response, request);
    }

    if (!user.is_verified) {
      const response = NextResponse.json(
        {
          errorType: "USER_NOT_VERIFIED",
          message: "Please verify your email before logging in.",
        },
        { status: 403 }
      );
      return addCorsHeaders(response, request);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response = NextResponse.json(
        { errorType: "INVALID_PASSWORD", message: "Invalid password." },
        { status: 400 }
      );
      return addCorsHeaders(response, request);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Update refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Prepare user data
    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      balance: user.balance,
      status: user.status,
      token: accessToken,
    };

    // Set cookies
    const response = NextResponse.json({
      message: "Login successful.",
      user: userData,
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return addCorsHeaders(response, request);
  } catch (error: any) {
    console.error("Login error:", error);
    const response = NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, request);
  }
}

