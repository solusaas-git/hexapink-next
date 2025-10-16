import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/lib/models/Message";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      message,
      agreeToEmails,
      token,
    } = await request.json();

    // Verify Cloudflare Turnstile token if provided
    if (token) {
      const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
      const formData = new FormData();
      formData.append("secret", process.env.TURNSTILE_SECRET_KEY || "");
      formData.append("response", token);

      const result = await fetch(url, {
        body: formData,
        method: "POST",
      });

      const outcome = await result.json();
      
      if (!outcome.success) {
        return NextResponse.json(
          { 
            type: "FAILD_CAPTCHA_VERIFICATION",
            message: "Failed to verify captcha" 
          },
          { status: 400 }
        );
      }
    }

    // Create new message
    const newMessage = new Message({
      firstName,
      lastName,
      email,
      phone,
      company,
      message,
      agreeToEmails,
    });

    await newMessage.save();

    // TODO: Emit socket.io event if needed
    // const io = getIO();
    // io.emit('newMessage', newMessage);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to save message" },
      { status: 500 }
    );
  }
}

