"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, CreditCard, Copy, Upload, Minus, Plus } from "lucide-react";
import UserHeader from "@/components/user/UserHeader";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/lib/api-client";
import { formatDate } from "@/lib/utils/formatDate";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

interface Transaction {
  _id: string;
  type: string;
  paymentmethod: string;
  price: number;
  status: string;
  createdAt: string;
  description?: string;
}

// Stripe Payment Form Component
function StripePaymentForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/user/wallet`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-pink text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Spinner size="sm" color="#FFFFFF" /> : <CreditCard size={20} />}
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function WalletPage() {
  const { currentUser } = useUserContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [amountMode, setAmountMode] = useState<"insert" | "pick">("insert");
  const [paymentType, setPaymentType] = useState<"bank" | "card">("bank");
  const [selectedBank, setSelectedBank] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/transaction/topups?status=${filterStatus}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await api.get("/payments/public");
      console.log("Fetched payment methods:", response.data);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Set empty array if error
      setPaymentMethods([]);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchPaymentMethods();
  }, [fetchTransactions, fetchPaymentMethods]);

  const handleAmountChange = (value: string) => {
    setTopUpAmount(value);
  };

  const handleAmountIncrement = () => {
    const current = parseFloat(topUpAmount) || 0;
    setTopUpAmount((current + 10).toFixed(2));
  };

  const handleAmountDecrement = () => {
    const current = parseFloat(topUpAmount) || 0;
    if (current > 10) {
      setTopUpAmount((current - 10).toFixed(2));
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const createStripePaymentIntent = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setStripeLoading(true);
      const response = await api.post("/wallet/create-payment-intent", {
        amount: parseFloat(topUpAmount),
      });
      setClientSecret(response.data.clientSecret);
    } catch {
      toast.error("Failed to initialize payment");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }

    if (!receiptFile) {
      toast.error("Please upload a receipt");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("amount", topUpAmount);
      formData.append("paymentMethod", selectedBank);
      formData.append("receipt", receiptFile);

      await api.post("/wallet/topup-request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Top-up request submitted successfully");
      setTopUpAmount("");
      setSelectedBank("");
      setReceiptFile(null);
      setShowTopUpModal(false);
      fetchTransactions();
    } catch (error: any) {
      console.error("Top-up request error:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  const handlePaymentTypeChange = (type: "bank" | "card") => {
    setPaymentType(type);
    if (type === "card" && topUpAmount && parseFloat(topUpAmount) > 0) {
      createStripePaymentIntent();
    }
  };

  // Calculate statistics
  const completedTransactions = transactions.filter(t => t.status === "Completed");
  const totalTopups = completedTransactions.filter(t => t.type === "Topup").reduce((sum, t) => sum + (t.price || 0), 0);
  const totalSpent = completedTransactions.filter(t => t.type !== "Topup").reduce((sum, t) => sum + (t.price || 0), 0);

  return (
    <div className="h-full flex flex-col">
      <UserHeader icon={<Wallet />} label="Wallet" />

      <div className="flex-1 px-8 py-6 overflow-auto bg-light-gray-1">
        {/* Balance Card and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Balance Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #FF6699 0%, #FF3377 100%)' }}>
            <div className="relative z-10">
              <p className="text-sm opacity-90 mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold mb-6">${(currentUser?.balance || 0).toFixed(2)}</h2>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="bg-white text-pink px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowUpCircle size={20} />
                Add Funds
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mb-24"></div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border-2 border-light-gray-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-light-dark">Total Added</p>
                  <p className="text-xl font-bold text-dark">${totalTopups.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border-2 border-light-gray-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-light-dark">Total Spent</p>
                  <p className="text-xl font-bold text-dark">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-xl border-2 border-light-gray-3 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <Wallet className="text-pink" size={24} />
              Transaction History
            </h3>
            <div className="flex items-center gap-2 bg-light-gray-2 border border-light-gray-3 rounded-lg p-1">
              {["All", "Completed", "Waiting"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                    filterStatus === status
                      ? "bg-white shadow-sm text-pink"
                      : "text-light-dark hover:text-dark"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="#FF6699" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-light-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={40} className="text-pink" />
              </div>
              <p className="text-light-dark text-lg">No transactions yet</p>
              <p className="text-sm text-light-dark mt-2">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 bg-light-gray-2 rounded-xl hover:bg-light-gray-3 transition-colors border border-transparent hover:border-pink"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === "Topup" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {transaction.type === "Topup" ? (
                        <ArrowUpCircle className="text-green-600" size={24} />
                      ) : (
                        <ArrowDownCircle className="text-red-600" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-dark">
                        {transaction.type === "Order" ? "Lead Purchase" : transaction.type}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-light-dark">{transaction.paymentmethod || "N/A"}</p>
                        <span className="text-xs text-light-dark">•</span>
                        <p className="text-sm text-light-dark">{formatDate(transaction.createdAt)}</p>
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : transaction.status === "Waiting"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                    <p className={`text-xl font-bold ${
                      transaction.type === "Topup" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "Topup" ? "+" : "-"}${(transaction.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-light-gray-3 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-dark">My Balance</h3>
                <p className="text-3xl font-bold text-dark-blue mt-1">${(currentUser?.balance || 0).toFixed(2)}</p>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-light-dark hover:text-dark text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Up Amount */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Top Up Amount</h4>
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => setAmountMode("insert")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      amountMode === "insert"
                        ? "bg-dark-blue text-white"
                        : "bg-light-gray-2 text-light-dark"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      amountMode === "insert" ? "border-white" : "border-light-dark"
                    }`}>
                      {amountMode === "insert" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    Insert
                  </button>
                  <button
                    onClick={() => setAmountMode("pick")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      amountMode === "pick"
                        ? "bg-dark-blue text-white"
                        : "bg-light-gray-2 text-light-dark"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      amountMode === "pick" ? "border-white" : "border-light-dark"
                    }`}>
                      {amountMode === "pick" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    Pick
                  </button>
                </div>

                {amountMode === "insert" ? (
                  <div className="flex items-center gap-2 bg-light-gray-2 rounded-xl p-2">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={topUpAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1 bg-transparent px-4 py-2 text-2xl font-bold text-dark-blue outline-none"
                      placeholder="0.0000"
                    />
                    <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
                      <span className="text-light-dark font-semibold">$</span>
                      <button
                        type="button"
                        onClick={handleAmountDecrement}
                        className="p-2 hover:bg-light-gray-2 rounded-lg transition-colors"
                      >
                        <Minus size={18} className="text-light-dark" />
                      </button>
                      <button
                        type="button"
                        onClick={handleAmountIncrement}
                        className="p-2 hover:bg-light-gray-2 rounded-lg transition-colors"
                      >
                        <Plus size={18} className="text-light-dark" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100, 200, 500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTopUpAmount(amount.toString())}
                        className={`py-3 rounded-xl font-semibold transition-all ${
                          topUpAmount === amount.toString()
                            ? "bg-dark-blue text-white"
                            : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Method</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePaymentTypeChange("bank")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      paymentType === "bank"
                        ? "bg-dark-blue text-white"
                        : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "bank" ? "border-white" : "border-dark"
                    }`}>
                      {paymentType === "bank" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    Bank Transfer
                  </button>
                  <button
                    onClick={() => handlePaymentTypeChange("card")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      paymentType === "card"
                        ? "bg-dark-blue text-white"
                        : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "card" ? "border-white" : "border-dark"
                    }`}>
                      {paymentType === "card" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    Credit Card
                  </button>
                </div>
              </div>

              {/* Bank Transfer Section */}
              {paymentType === "bank" && (
                <>
                  {/* Bank Selection */}
                  <div>
                    <h4 className="font-semibold text-dark mb-3">Bank</h4>
                    {paymentMethods.length === 0 ? (
                      <p className="text-sm text-light-dark p-4 bg-light-gray-2 rounded-xl">
                        No payment methods available. Please contact admin to add payment methods.
                      </p>
                    ) : paymentMethods.filter(m => m.paymentType === "bank").length === 0 ? (
                      <p className="text-sm text-light-dark p-4 bg-light-gray-2 rounded-xl">
                        No bank transfer methods available. Found {paymentMethods.length} payment methods total.
                      </p>
                    ) : null}
                    <div className="space-y-2">
                      {paymentMethods.filter(m => m.paymentType === "bank").map((method) => (
                        <button
                          key={method._id}
                          onClick={() => setSelectedBank(method._id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            selectedBank === method._id
                              ? "bg-dark-blue text-white"
                              : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedBank === method._id ? "border-white" : "border-dark"
                          }`}>
                            {selectedBank === method._id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                          </div>
                          {method.bankLogo && (
                            <div className="w-20 h-12 bg-white rounded-lg border border-light-gray-3 flex items-center justify-center p-2">
                              <NextImage
                                src={method.bankLogo.startsWith('/') ? method.bankLogo : `/${method.bankLogo}`}
                                alt={method.bankName}
                                width={80}
                                height={48}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                          <span className="font-semibold">{method.bankName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Details */}
                  {selectedBank && (
                    <div>
                      <h4 className="font-semibold text-dark mb-3">To Make a transfer</h4>
                      <div className="bg-light-gray-2 rounded-xl overflow-hidden">
                        {(() => {
                          const bank = paymentMethods.find(m => m._id === selectedBank);
                          return (
                            <>
                              {[
                                { label: "BANK NAME", value: bank?.bankName },
                                { label: "ACCOUNT OWNER", value: bank?.accountOwner },
                                { label: "ACCOUNT NUMBER", value: bank?.accountNumber },
                                { label: "RIB", value: bank?.rib },
                                { label: "IBAN", value: bank?.iban },
                                { label: "SWIFT", value: bank?.swift },
                              ].map((item, index) => (
                                <div key={index} className={`flex items-center justify-between p-4 ${index !== 0 ? "border-t border-white" : ""}`}>
                                  <span className="text-sm font-semibold text-light-dark uppercase">{item.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-dark">{item.value || "N/A"}</span>
                                    {item.value && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyToClipboard(item.value)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                      >
                                        <Copy size={16} className="text-dark-blue" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Upload Receipt */}
                  <div>
                    <h4 className="font-semibold text-dark mb-3">Upload Receipt</h4>
                    <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-dark-blue rounded-xl text-dark-blue font-semibold cursor-pointer hover:bg-light-pink-2 transition-colors">
                      <Upload size={20} />
                      {receiptFile ? receiptFile.name : "Upload Receipt"}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleBankTransferSubmit}
                    className="w-full bg-dark-blue text-white py-4 rounded-xl hover:opacity-90 transition-opacity font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle size={20} />
                    Top Up
                  </button>
                </>
              )}

              {/* Credit Card Section */}
              {paymentType === "card" && (
                <div>
                  {stripeLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" color="#FF6699" />
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm 
                        amount={parseFloat(topUpAmount) || 0}
                        onSuccess={() => {
                          setShowTopUpModal(false);
                          fetchTransactions();
                        }}
                      />
                    </Elements>
                  ) : (
                    <p className="text-center text-light-dark py-4">
                      Enter an amount and select Credit Card to proceed with payment
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
