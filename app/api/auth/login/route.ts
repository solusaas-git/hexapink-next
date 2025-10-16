import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sanitizeBody } from "@/lib/middleware/sanitize";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = sanitizeBody(body);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { errorType: "USER_NOT_FOUND", message: "User does not exist." },
        { status: 400 }
      );
    }

    if (user.status === "Suspended") {
      return NextResponse.json(
        {
          errorType: "USER_SUSPENDED",
          message: "Your account has been suspended. Please contact support.",
        },
        { status: 403 }
      );
    }

    if (!user.is_verified) {
      return NextResponse.json(
        {
          errorType: "USER_NOT_VERIFIED",
          message: "Please verify your email before logging in.",
        },
        { status: 403 }
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { errorType: "INVALID_PASSWORD", message: "Invalid password." },
        { status: 400 }
      );
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

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

