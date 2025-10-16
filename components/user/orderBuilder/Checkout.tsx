import NextImage from "next/image";
import React, { useState, useEffect } from "react";
import { Wallet, Building, CreditCard, Upload, FileText, AlertCircle } from "lucide-react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import useCartStore from "@/lib/stores/useCartStore";
import { useRouter } from "next/navigation";
import type { Collection, SelectedData, PaymentMethod } from "@/types/orderBuilder";

interface CheckoutProps {
  orderPrice: number;
  paymentMethod: string;
  selectedBank: PaymentMethod | undefined;
  type: string;
  selectedCountries: string[];
  selectedCollection: Collection | undefined;
  filteredData: any[];
  selectedData: SelectedData;
  volume: number;
  selectedCartIds: string[];
  setPaymentMethod: (method: string) => void;
  setSelectedBank: (bank: PaymentMethod | undefined) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  onConfirmOrder: () => void;
  orderLoading: boolean;
}

export default function Checkout({
  orderPrice,
  paymentMethod,
  selectedBank,
  type,
  selectedCountries,
  selectedCollection,
  filteredData,
  selectedData,
  volume,
  selectedCartIds,
  setPaymentMethod,
  setSelectedBank,
  selectedFiles,
  setSelectedFiles,
  onConfirmOrder,
  orderLoading,
}: CheckoutProps) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUserContext();
  const { carts, removeCarts } = useCartStore();
  const stripe = useStripe();
  const elements = useElements();
  
  const [banks, setBanks] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = ["Balance", "Bank Transfer", "Credit Card"];

  // Fetch banks for bank transfer
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get("/payments/public");
        const bankPayments = response.data.filter(
          (p: PaymentMethod) => p.paymentType === "bank"
        );
        setBanks(bankPayments);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    if (paymentMethod === "Bank Transfer") {
      fetchBanks();
    }
  }, [paymentMethod]);

  // Validate balance for Balance payment
  const isBalanceSufficient = currentUser && currentUser.balance >= orderPrice;

  // Handle file change for receipts
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setErrors({ ...errors, receipt: "" });
    }
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    // Validation
    if (volume === 0) {
      toast.error("Volume cannot be zero");
      return;
    }

    if (paymentMethod === "Balance" && !isBalanceSufficient) {
      setErrors({ ...errors, balance: "Insufficient balance" });
      return;
    }

    if (paymentMethod === "Bank Transfer") {
      if (!selectedBank) {
        setErrors({ ...errors, bank: "Please select a bank" });
        return;
      }
      if (selectedFiles.length === 0) {
        setErrors({ ...errors, receipt: "Please upload payment receipt" });
        return;
      }
    }

    if (paymentMethod === "Credit Card") {
      if (!stripe || !elements) {
        toast.error("Stripe is not loaded");
        return;
      }
    }

    try {
      setLoading(true);

      // Prepare files data
      let filesData;
      if (selectedCartIds.length > 0) {
        // Cart checkout
        const selectedCarts = carts.filter((cart) =>
          selectedCartIds.includes(cart.id)
        );
        filesData = selectedCarts.map((cart) => ({
          title: cart.title,
          type: cart.type,
          countries: cart.countries,
          collectionId: cart.collectionId,
          image: cart.image || "",
          unitPrice: cart.unitPrice,
          columns: cart.columns,
          filteredData: cart.filteredData,
        }));
      } else {
        // Direct order
        filesData = [{
          title: selectedCollection?.title || "Order",
          type,
          countries: selectedCountries,
          collectionId: selectedCollection?._id || "",
          image: selectedCollection?.mobileImage || selectedCollection?.image || "",
          unitPrice: selectedCollection?.fee || 0,
          columns: selectedData,
          filteredData,
        }];
      }

      // Build form data
      const formData = new FormData();
      formData.append("files", JSON.stringify(filesData));
      formData.append("volume", volume.toString());
      formData.append("prix", orderPrice.toString());
      formData.append("paid", paymentMethod === "Balance" ? "Paid" : "Unpaid");
      formData.append("paymentMethod", paymentMethod);

      // Append receipts
      for (const file of selectedFiles) {
        formData.append("receipts", file);
      }

      // Handle Stripe payment if Credit Card
      if (paymentMethod === "Credit Card") {
        const { error: submitError } = await elements!.submit();
        if (submitError) {
          toast.error(submitError.message || "Payment error");
          setLoading(false);
          return;
        }

        const { error } = await stripe!.confirmPayment({
          elements: elements!,
          redirect: "if_required",
        });

        if (error) {
          toast.error(error.message || "Payment failed");
          setLoading(false);
          return;
        }

        // Update form data to mark as paid
        formData.set("paid", "Paid");
      }

      // Create order
      const response = await api.post("/order/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Order created successfully!");

        // Update user balance if Balance payment
        if (paymentMethod === "Balance" && currentUser) {
          setCurrentUser({
            ...currentUser,
            balance: currentUser.balance - orderPrice,
          });
        }

        // Remove from cart if cart checkout
        if (selectedCartIds.length > 0) {
          removeCarts(selectedCartIds);
        }

        // Navigate to files page
        router.push("/user/files");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-light-gray-1 p-6">
        <h2 className="text-2xl font-bold text-dark mb-6">Checkout</h2>
        
        {/* Order Summary */}
        <div className="mb-6 p-4 bg-light-gray-1 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Volume:</span>
              <span className="font-semibold">{volume.toLocaleString()} leads</span>
            </div>
            {selectedCartIds.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Files:</span>
                <span className="font-semibold">{selectedCartIds.length} files</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-dashed border-light-gray-3">
              <span className="text-gray-600 font-semibold">Total Price:</span>
              <span className="font-bold text-dark-blue text-xl">${orderPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => {
                  setPaymentMethod(method);
                  setErrors({});
                }}
                disabled={loading}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === method
                    ? "border-dark-blue bg-dark-blue/5"
                    : "border-light-gray-3 hover:border-dark-blue"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {method === "Balance" && <Wallet className="text-dark-blue" size={24} />}
                {method === "Bank Transfer" && <Building className="text-dark-blue" size={24} />}
                {method === "Credit Card" && <CreditCard className="text-dark-blue" size={24} />}
                <span className="font-medium">{method}</span>
              </button>
            ))}
          </div>

          {/* Balance Info */}
          {paymentMethod === "Balance" && (
            <div className={`mt-4 p-4 rounded-lg ${isBalanceSufficient ? "bg-green/10 border border-green" : "bg-red-100 border border-red-500"}`}>
              <div className="flex items-start gap-2">
                {!isBalanceSufficient && <AlertCircle className="text-red-500 flex-shrink-0" size={20} />}
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    Current Balance: ${currentUser?.balance.toFixed(2) || "0.00"}
                  </p>
                  {!isBalanceSufficient && (
                    <p className="text-red-500 text-sm">
                      Insufficient balance. Please top up your wallet or choose another payment method.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Selection */}
          {paymentMethod === "Bank Transfer" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Bank *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {banks.map((bank) => (
                    <button
                      key={bank._id}
                      onClick={() => {
                        setSelectedBank(bank);
                        setErrors({ ...errors, bank: "" });
                      }}
                      disabled={loading}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedBank?._id === bank._id
                          ? "border-dark-blue bg-dark-blue/5"
                          : "border-light-gray-3 hover:border-dark-blue"
                      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        {bank.bankLogo && (
                          <NextImage
                            src={bank.bankLogo.startsWith('/') ? bank.bankLogo : `/${bank.bankLogo}`}
                            alt={bank.bankName || "Bank logo"}
                            width={64}
                            height={40}
                            className="w-16 h-10 object-contain"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{bank.bankName}</p>
                          <p className="text-xs text-gray-600">{bank.accountOwner}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.bank && (
                  <p className="text-red-500 text-sm mt-1">{errors.bank}</p>
                )}
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Payment Receipt *
                </label>
                <div className="border-2 border-dashed border-light-gray-3 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    multiple
                    disabled={loading}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="text-gray-400 mb-2" size={32} />
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <p key={index} className="text-sm font-medium text-dark-blue">
                            <FileText className="inline mr-1" size={14} />
                            {file.name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Click to upload receipt(s)</p>
                    )}
                  </label>
                </div>
                {errors.receipt && (
                  <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>
                )}
              </div>
            </div>
          )}

          {/* Stripe Payment Element */}
          {paymentMethod === "Credit Card" && (
            <div className="mt-4 p-4 border border-light-gray-3 rounded-lg">
              <PaymentElement />
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          onClick={paymentMethod === "Credit Card" ? handleCreateOrder : onConfirmOrder}
          disabled={loading || orderLoading || (paymentMethod === "Balance" && !isBalanceSufficient)}
          className="w-full bg-dark-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || orderLoading ? "Processing..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
}

