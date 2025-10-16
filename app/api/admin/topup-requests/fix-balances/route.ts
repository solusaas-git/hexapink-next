import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { authenticate } from "@/lib/middleware/authenticate";

/**
 * ONE-TIME FIX: This endpoint recalculates user balances based on completed topup transactions
 * Use this to fix balances for transactions that were approved before the balance update was working
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Find all completed topup transactions
    const completedTopups = await Transaction.find({
      type: "Topup",
      status: "Completed"
    }).populate("userId");

    console.log(`Found ${completedTopups.length} completed topup transactions`);

    const fixes = [];
    
    for (const transaction of completedTopups) {
      if (!transaction.userId) {
        console.log(`Skipping transaction ${transaction._id} - no user found`);
        continue;
      }

      const userId = transaction.userId._id || transaction.userId;
      
      // Get user's current balance
      const currentUser = await User.findById(userId);
      
      if (!currentUser) {
        console.log(`User not found for transaction ${transaction._id}`);
        continue;
      }

      // Calculate what the balance should be
      const userTopups = await Transaction.find({
        userId: userId,
        type: "Topup",
        status: "Completed"
      });

      const totalTopups = userTopups.reduce((sum, t) => sum + (t.price || 0), 0);

      // Calculate total spent (orders + lookups)
      const userOrders = await Transaction.find({
        userId: userId,
        type: { $in: ["Order", "Lookup"] },
        status: "Completed"
      });

      const totalSpent = userOrders.reduce((sum, t) => sum + (t.price || 0), 0);

      const correctBalance = totalTopups - totalSpent;

      console.log(`User ${currentUser.email}:`, {
        currentBalance: currentUser.balance,
        totalTopups,
        totalSpent,
        correctBalance,
        difference: correctBalance - currentUser.balance
      });

      // Check if balance is different (with tolerance for floating point)
      const balanceDiff = Math.abs(correctBalance - currentUser.balance);
      if (balanceDiff > 0.001) {
        console.log(`Fixing balance for ${currentUser.email}`);
        
        // Update the balance
        await User.findByIdAndUpdate(userId, {
          balance: correctBalance
        });

        fixes.push({
          userId: userId,
          email: currentUser.email,
          oldBalance: currentUser.balance,
          newBalance: correctBalance,
          difference: correctBalance - currentUser.balance
        });
      }
    }

    return NextResponse.json({
      message: `Fixed ${fixes.length} user balances`,
      fixes
    });

  } catch (error) {
    console.error("Error fixing balances:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}

