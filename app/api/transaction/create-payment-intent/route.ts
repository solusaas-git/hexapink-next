import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { authenticate } from "@/lib/middleware/authenticate";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Create a payment intent with a minimum amount (will be updated before confirmation)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 minimum (will be updated on actual payment)
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user._id.toString(),
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

