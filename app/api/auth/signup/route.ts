import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import juice from "juice";
import { sendEmailWithFailover } from "@/lib/utils/email";
import { isEmail } from "@/lib/utils/session";
import { sanitizeBody } from "@/lib/middleware/sanitize";

// Generate OTP and expiration time
const generateOtp = () => ({
  code: Math.floor(100000 + Math.random() * 900000).toString(),
  expiration: Date.now() + 600000, // 10 minutes
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const sanitizedBody = sanitizeBody(body);
    const { email, password } = sanitizedBody;

    // Validate email and password
    if (!isEmail(email)) {
      return NextResponse.json(
        { message: "Email must be a valid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string") {
      return NextResponse.json(
        { message: "Password must be a string." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        {
          errorType: existUser.is_verified
            ? "USER_ALREADY_REGISTERED"
            : "USER_ALREADY_EXISTS",
          message: existUser.is_verified
            ? "You have already registered. Please log in."
            : "User already exists. Please verify your email.",
        },
        { status: 400 }
      );
    }

    // Generate OTP and hash password
    const { code: otp, expiration: otpExpiration } = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      ...sanitizedBody,
      password: hashedPassword,
      otp,
      otp_expiration: new Date(otpExpiration),
    });
    await user.save();

    // Send OTP email
    const templatePath = path.join(
      process.cwd(),
      "lib/templates/otp-email.html"
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, "utf8")
      .replace(/OTP_CODE/g, otp);
    const inlinedHtml = juice(htmlTemplate);

    await sendEmailWithFailover({
      to: email,
      subject: "Verify Email",
      html: inlinedHtml,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public/logo.svg"),
          cid: "logo-image",
        },
      ],
    });

    return NextResponse.json(
      {
        message:
          "You have successfully registered. Please check your email.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

