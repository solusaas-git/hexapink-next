import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import Table from "@/lib/models/Table";
import Collection from "@/lib/models/Collection";
import Transaction from "@/lib/models/Transaction";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Get current date and calculate time ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Get start of current month and previous month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch total counts
    const [
      totalUsers,
      totalOrders,
      totalTables,
      totalCollections,
      usersLastMonth,
      pendingOrders,
      transactions
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Table.countDocuments(),
      Collection.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ paid: { $ne: "Paid" } }),
      Transaction.find({ status: "Completed" }).lean()
    ]);

    // Calculate total revenue from completed transactions
    const totalRevenue = transactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate revenue from last 7 days (this week)
    const weekTransactions = transactions.filter((t: any) => 
      new Date(t.createdAt) >= sevenDaysAgo
    );
    const weekRevenue = weekTransactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate revenue from current month
    const monthTransactions = transactions.filter((t: any) => 
      new Date(t.createdAt) >= startOfMonth
    );
    const monthRevenue = monthTransactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate revenue from last 30 days for growth
    const recentTransactions = transactions.filter((t: any) => 
      new Date(t.createdAt) >= thirtyDaysAgo
    );
    const recentRevenue = recentTransactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate revenue from previous week (for week growth)
    const prevWeekTransactions = transactions.filter((t: any) => {
      const date = new Date(t.createdAt);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });
    const prevWeekRevenue = prevWeekTransactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate revenue from previous month (for month growth)
    const prevMonthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.createdAt);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });
    const prevMonthRevenue = prevMonthTransactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate growth percentages
    const totalUsersLastMonth = totalUsers - usersLastMonth;
    const userGrowth = totalUsersLastMonth > 0 
      ? Math.round((usersLastMonth / totalUsersLastMonth) * 100) 
      : 0;

    const oldRevenue = totalRevenue - recentRevenue;
    const revenueGrowth = oldRevenue > 0 
      ? Math.round((recentRevenue / oldRevenue) * 100) 
      : 0;

    // Calculate week revenue growth (comparing to previous week)
    const weekRevenueGrowth = prevWeekRevenue > 0 
      ? Math.round(((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100) 
      : weekRevenue > 0 ? 100 : 0;

    // Calculate month revenue growth (comparing to previous month)
    const monthRevenueGrowth = prevMonthRevenue > 0 
      ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) 
      : monthRevenue > 0 ? 100 : 0;

    const stats = {
      totalUsers,
      totalOrders,
      totalTables,
      totalCollections,
      totalRevenue,
      weekRevenue,
      monthRevenue,
      pendingOrders,
      userGrowth,
      revenueGrowth,
      weekRevenueGrowth,
      monthRevenueGrowth
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
