import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import Order from "@/lib/models/Order";
import Lookup from "@/lib/models/Lookup";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticate(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = authUser._id;

    // Get current date and calculate time ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch user stats
    const [totalFiles, totalOrders, totalLookups, orders] = await Promise.all([
      File.countDocuments({ user: userId }),
      Order.countDocuments({ user: userId }),
      Lookup.countDocuments({ user: userId }),
      Order.find({ user: userId, paid: "Paid" }).lean()
    ]);

    // Calculate total spent from paid orders
    const totalSpent = orders.reduce((sum, order: any) => {
      return sum + (order.prix || 0);
    }, 0);

    // Calculate spending from last 7 days (this week)
    const weekOrders = orders.filter((o: any) => 
      new Date(o.createdAt) >= sevenDaysAgo
    );
    const weekSpent = weekOrders.reduce((sum, order: any) => {
      return sum + (order.prix || 0);
    }, 0);

    // Calculate spending from current month
    const monthOrders = orders.filter((o: any) => 
      new Date(o.createdAt) >= startOfMonth
    );
    const monthSpent = monthOrders.reduce((sum, order: any) => {
      return sum + (order.prix || 0);
    }, 0);

    const stats = {
      totalFiles,
      totalOrders,
      totalLookups,
      totalSpent,
      weekSpent,
      monthSpent,
      balance: authUser.balance || 0
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
