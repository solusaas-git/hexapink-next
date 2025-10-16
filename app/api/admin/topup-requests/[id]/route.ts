import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { authenticate } from "@/lib/middleware/authenticate";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    await connectDB();

    // Find the transaction
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log("Transaction found:", {
      id: transaction._id,
      userId: transaction.userId,
      price: transaction.price,
      currentStatus: transaction.status,
      newStatus: status
    });

    // Update based on status
    if (status === "approved") {
      // Check if already approved
      if (transaction.status === "Completed") {
        return NextResponse.json(
          { message: "Transaction already approved" },
          { status: 400 }
        );
      }

      // Update transaction status to Completed
      transaction.status = "Completed";
      await transaction.save();

      // Add amount to user's balance using findByIdAndUpdate with new option
      const userBefore = await User.findById(transaction.userId);
      
      if (!userBefore) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      console.log("User before update:", {
        id: userBefore._id,
        email: userBefore.email,
        balanceBefore: userBefore.balance,
        amountToAdd: transaction.price
      });

      // Update balance using atomic operation
      const updatedUser = await User.findByIdAndUpdate(
        transaction.userId,
        {
          $inc: { balance: transaction.price }
        },
        { new: true, runValidators: false }
      );

      console.log("User after update:", {
        balanceAfter: updatedUser?.balance,
        updateSuccessful: !!updatedUser
      });

      return NextResponse.json({
        message: "Top-up request approved and balance updated",
        transaction,
        user: {
          id: updatedUser?._id,
          email: updatedUser?.email,
          newBalance: updatedUser?.balance
        }
      });
    } else if (status === "rejected") {
      // Just update status, don't change balance
      transaction.status = "Free"; // Using "Free" as rejected status
      await transaction.save();

      return NextResponse.json({
        message: "Top-up request rejected",
        transaction,
      });
    } else {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating topup request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

