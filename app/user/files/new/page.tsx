"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderOpen, ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import UserHeader from "@/components/user/UserHeader";
import { useUserContext } from "@/contexts/UserContext";
import useCartStore from "@/lib/stores/useCartStore";
import useFileDataStore from "@/lib/stores/useFileDataStore";
import api from "@/lib/api-client";

import VerticalStepBar from "@/components/user/orderBuilder/VerticalStepBar";
import TypeSelect from "@/components/user/orderBuilder/TypeSelect";
import CountrySelect from "@/components/user/orderBuilder/CountrySelect";
import CollectionSelect from "@/components/user/orderBuilder/CollectionSelect";
import ColumnBuild from "@/components/user/orderBuilder/ColumnBuild";
import CollectionView from "@/components/user/orderBuilder/CollectionView";
import Checkout from "@/components/user/orderBuilder/Checkout";
import Spinner from "@/components/common/ui/Spinner";

import type {
  Step,
  Column,
  Collection,
  SelectedData,
  FilteredDataRow,
  PaymentMethod,
} from "@/types/orderBuilder";

const types = ["Business", "Client"];
const defaultStep: Step = { id: 1, name: "Collection" };
const paymentMethods = ["Balance", "Bank Transfer", "Credit Card"];

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null;

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setCurrentUser } = useUserContext();
  const { carts, removeCarts } = useCartStore();
  const { setFilesData } = useFileDataStore();

  // Get selected cart IDs from query params
  const selectedCartIds = useMemo(() => {
    return searchParams.get("cartIds")?.split(",") || [];
  }, [searchParams]);

  // State management
  const [steps, setSteps] = useState<Step[]>([defaultStep]);
  const [step, setStep] = useState(1);
  const [type, setType] = useState(types[0]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | undefined>(undefined);
  const [volume, setVolume] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [selectedStepColumns, setSelectedStepColumns] = useState<Column[]>([]);
  const [selectedData, setSelectedData] = useState<SelectedData>({});
  const [filteredData] = useState<FilteredDataRow[]>([]);
  const [filteredDataCount, setFilteredDataCount] = useState<number>(0);
  
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0]);
  const [selectedBank, setSelectedBank] = useState<PaymentMethod | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [clientSecretSettings, setClientSecretSettings] = useState({
    clientSecret: "",
    loading: true,
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<string>("Volume");
  const [budgetInput, setBudgetInput] = useState<number>(0);
  const [selectedOptionalColumns, setSelectedOptionalColumns] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [lastCalculatedFilters, setLastCalculatedFilters] = useState<string>("");
  const [purchasedCount, setPurchasedCount] = useState<number>(0);

  // Initialize Stripe payment intent
  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await api.post("/transaction/create-payment-intent", {});
        setClientSecretSettings({
          clientSecret: response.data.client_secret,
          loading: false,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        setClientSecretSettings({
          clientSecret: "",
          loading: false,
        });
      }
    }

    createPaymentIntent();
  }, []);

  // Handle cart checkout flow
  useEffect(() => {
    if (selectedCartIds.length > 0 && carts.length > 0) {
      setSteps([defaultStep, { id: 2, name: "Checkout" }]);
      setStep(2);
      const selectedCarts = carts.filter((cart) =>
        selectedCartIds.includes(cart.id)
      );
      const totalPrice = selectedCarts.reduce(
        (amount, cart) => amount + cart.volume * (cart.unitPrice ?? 1),
        0
      );
      setSubTotal(totalPrice);
    }
  }, [selectedCartIds, carts]);

  // Generate dynamic steps when collection is selected
  useEffect(() => {
    if (selectedCollection && Array.isArray(selectedCollection.columns)) {
      const stepItems = Array.from(
        new Set(
          selectedCollection.columns
            .filter((col) => col.showToClient === true)
            .map((col) => col.stepName)
            .filter((name): name is string => name !== "" && name !== undefined)
        )
      ).map((name, index) => ({ id: index + 2, name }));

      setSteps([
        defaultStep,
        ...stepItems,
        { id: stepItems.length + 2, name: "Checkout" },
      ]);

      // Fetch total leads (don't load actual data - too large)
      const fetchData = async () => {
        try {
          setLeadsLoading(true);
          // Fetch total leads for available volume
          const leadsResponse = await api.get(
            `/collection/total-leads/${selectedCollection._id}`
          );
          setFilteredDataCount(leadsResponse.data.totalLeads || 0);
          setVolume(1000); // Set default volume to 1000

          // Fetch purchased leads count
          const purchasedResponse = await api.get(
            `/collection/purchased-count?collectionId=${selectedCollection._id}`
          );
          setPurchasedCount(purchasedResponse.data.purchasedCount || 0);

          // Don't fetch table data - it's too large for 1.5M+ rows
          // Filtering will be done server-side when order is created
        } catch (error) {
          console.error("Error fetching collection data:", error);
        } finally {
          setLeadsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedCollection, setFilesData]);

  // Update selected step columns when step changes
  useEffect(() => {
    if (selectedCollection) {
      const relatedColumns = selectedCollection.columns.filter(
        (col) => col.stepName === steps[step - 1]?.name && col.showToClient
      );
      setSelectedStepColumns(relatedColumns);
    }
  }, [step, selectedCollection, steps]);

  // Calculate filtered data count with actual filtering logic
  // Calculate subTotal based on volume (don't auto-set volume)
  useEffect(() => {
    const subTotalPrice = volume * (selectedCollection?.fee || 0);
    setSubTotal(Math.round(subTotalPrice * 100) / 100);
  }, [volume, selectedCollection]);

  // Calculate additional fees
  useEffect(() => {
    if (selectedCollection) {
      const additionalFees = selectedCollection.columns
        .filter(
          (column) =>
            column.isAdditionalFee &&
            (!column.optional || selectedOptionalColumns.includes(column.id))
        )
        .reduce((sum, column) => sum + (column.additionalFee || 0), 0);
      setAdditionalFee(Math.round(additionalFees * volume * 100) / 100);
    }
  }, [selectedOptionalColumns, selectedCollection, volume]);

  // Handler functions
  const handleChangeValue = (option: string, value: number) => {
    if (selectedCollection) {
      if (option === "Volume") {
        // Limit volume to available filtered data count
        const limitedValue = Math.min(value, filteredDataCount);
        setVolume(limitedValue);
        setErrors({ ...errors, volume: "" });
      } else if (option === "Budget") {
        // Store budget input
        setBudgetInput(value);
        
        // Calculate volume from budget
        // Budget = (volume * unitPrice) + (volume * sum(optional field fees))
        // Budget = volume * (unitPrice + sum(optional field fees))
        const unitPrice = selectedCollection.fee || 0;
        const optionalFeePerLead = selectedCollection.columns
          .filter(
            (column) =>
              column.isAdditionalFee &&
              column.optional &&
              selectedOptionalColumns.includes(column.id)
          )
          .reduce((sum, column) => sum + (column.additionalFee || 0), 0);
        
        const totalPricePerLead = unitPrice + optionalFeePerLead;
        const calculatedVolume = totalPricePerLead > 0 ? Math.floor(value / totalPricePerLead) : 0;
        
        // Limit volume to available filtered data count
        const limitedVolume = Math.min(calculatedVolume, filteredDataCount);
        setVolume(limitedVolume);
        setErrors({ ...errors, volume: "" });
      }
    }
  };

  const handleOptionChange = (option: string) => {
    setCalcMode(option);
    // Reset inputs when switching modes
    if (option === "Budget") {
      setBudgetInput(0);
    }
  };

  const handleOptionalFieldToggle = (columnId: number) => {
    setSelectedOptionalColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleClickBackStep = useCallback(() => {
    if (step === 1) {
      router.push("/");
    } else {
      setStep(step - 1);
    }
  }, [step, router]);

  const handleClickNextStep = useCallback(async () => {
    // Validate volume before proceeding
    if (volume === 0 && selectedCollection) {
      setErrors({ ...errors, volume: "Volume cannot be zero. Please set a volume before proceeding." });
      toast.error("Please set a volume before proceeding");
      return;
    }

    if (step === steps.length) {
      // Create order logic
      setOrderLoading(true);
      try {
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
          if (!selectedCollection) {
            toast.error("No collection selected");
            return;
          }
          filesData = [{
            title: selectedCollection.title,
            type,
            countries: selectedCountries,
            collectionId: selectedCollection._id,
            image: selectedCollection.mobileImage || selectedCollection.image || "",
            unitPrice: selectedCollection.fee || 0,
            columns: selectedData,
            filteredData,
          }];
        }

        // Cap volume to available filtered data count
        const actualVolume = Math.min(volume, filteredDataCount);
        
        // Build form data
        const formData = new FormData();
        formData.append("files", JSON.stringify(filesData));
        formData.append("volume", actualVolume.toString());
        formData.append("prix", (subTotal + additionalFee).toString());
        formData.append("paid", paymentMethod === "Balance" ? "Paid" : "Unpaid");
        formData.append("paymentMethod", paymentMethod);

        // Append receipts
        for (const file of selectedFiles) {
          formData.append("receipts", file);
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
              balance: currentUser.balance - (subTotal + additionalFee),
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
        setOrderLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  }, [step, steps, selectedCollection, type, selectedCountries, selectedData, filteredData, volume, subTotal, additionalFee, paymentMethod, selectedFiles, selectedCartIds, carts, currentUser, setCurrentUser, removeCarts, router, errors, filteredDataCount]);

  const handleColumnChange = useCallback(
    (
      columnType: string,
      columnName: string,
      selectedValue: any,
      stepName: string
    ) => {
      setSelectedData((prev) => ({
        ...prev,
        [columnName]: {
          value: selectedValue,
          stepName: stepName,
          type: columnType,
        },
      }));
    },
    []
  );

  // Calculate number of unapplied filter changes
  const unappliedChangesCount = useMemo(() => {
    if (!selectedCollection) return 0;
    
    const currentFiltersString = JSON.stringify(selectedData);
    
    // If no filters have been calculated yet, show count of current filters
    if (!lastCalculatedFilters) {
      return Object.keys(selectedData).length > 0 ? 1 : 0;
    }
    
    // If filters have changed since last calculation, show indicator
    return currentFiltersString !== lastCalculatedFilters ? 1 : 0;
  }, [selectedData, lastCalculatedFilters, selectedCollection]);

  // Handle update calculation - refresh available volume with filters
  const handleUpdateCalculation = useCallback(async () => {
    if (!selectedCollection) return;
    
    try {
      setLeadsLoading(true);
      // Fetch filtered leads count based on selected filters
      const leadsResponse = await api.post("/collection/filtered-leads", {
        collectionId: selectedCollection._id,
        selectedData: selectedData,
      });
      const newFilteredCount = leadsResponse.data.filteredLeadsCount || 0;
      setFilteredDataCount(newFilteredCount);
      
      // Update last calculated filters
      setLastCalculatedFilters(JSON.stringify(selectedData));
      
      // If current volume exceeds the new filtered count, adjust it to max
      if (volume > newFilteredCount) {
        setVolume(newFilteredCount);
        toast.info(`Volume adjusted to maximum available: ${newFilteredCount.toLocaleString()}`);
      } else {
        toast.success("Calculation updated!");
      }
    } catch (error) {
      console.error("Error updating calculation:", error);
      toast.error("Failed to update calculation");
    } finally {
      setLeadsLoading(false);
    }
  }, [selectedCollection, selectedData, volume]);

  return (
    <div className="h-screen flex flex-col">
      <UserHeader icon={<FolderOpen />} label="New Order" />

      <div className="flex flex-1 bg-light-gray overflow-hidden">
        {/* Left Sidebar - Step Bar */}
        <div className="px-6 py-8 h-full overflow-auto" style={{ paddingBottom: "5.5rem" }}>
          <VerticalStepBar steps={steps} stepNumber={step} />
        </div>

        {/* Main Content */}
        <div className="min-w-min h-full flex flex-1 flex-col border-l border-light-gray-1">
          {/* Body Content */}
          <div className="h-full overflow-y-auto flex flex-col flex-1" style={{ paddingBottom: "5.5rem" }}>
            {step === 1 && (
              <div className="flex flex-col gap-4 p-8">
                <TypeSelect
                  selectedItem={type}
                  onChange={setType}
                  items={types}
                />
                <CountrySelect
                  selectedCountries={selectedCountries}
                  setSelectedCountries={setSelectedCountries}
                  errors={errors}
                  setErrors={setErrors}
                />
                <CollectionSelect
                  type={type}
                  countries={selectedCountries}
                  selectedCollection={selectedCollection}
                  setSelectedCollection={setSelectedCollection}
                />
              </div>
            )}
            
            {step > 1 && step < steps.length && (
              <div className="flex flex-col p-8 gap-4">
                {selectedStepColumns.map((column) => (
                  <ColumnBuild
                    key={column.name}
                    column={column}
                    selectedData={selectedData}
                    setColumns={(columnType, columnName, selectedValue) =>
                      handleColumnChange(
                        columnType,
                        columnName,
                        selectedValue,
                        steps[step - 1].name
                      )
                    }
                  />
                ))}
              </div>
            )}

            {step > 1 &&
              step === steps.length &&
              (clientSecretSettings.loading ? (
                <div className="w-full flex items-center justify-center p-12">
                  <Spinner size="lg" color="#4040BF" />
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <Checkout
                    orderPrice={subTotal + additionalFee}
                    paymentMethod={paymentMethod}
                    selectedBank={selectedBank}
                    type={type}
                    selectedCountries={selectedCountries}
                    selectedCollection={selectedCollection}
                    filteredData={filteredData}
                    selectedData={selectedData}
                    volume={volume}
                    selectedCartIds={selectedCartIds}
                    setPaymentMethod={setPaymentMethod}
                    setSelectedBank={setSelectedBank}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    onConfirmOrder={handleClickNextStep}
                    orderLoading={orderLoading}
                  />
                </Elements>
              ))}
          </div>

        </div>

        {/* Right Sidebar - Collection View */}
        {selectedCollection && (
          <div className="w-96 p-4 border-l border-light-gray-1 h-full overflow-auto" style={{ paddingBottom: "5.5rem" }}>
            <CollectionView
              data={selectedCollection}
              filteredDataCount={filteredDataCount}
              calcMode={calcMode}
              volume={volume}
              subTotal={subTotal}
              additionalFee={additionalFee}
              budgetInput={budgetInput}
              selectedOptionalColumns={selectedOptionalColumns}
              errors={errors}
              leadsLoading={leadsLoading}
              purchasedCount={purchasedCount}
              handleChangeValue={handleChangeValue}
              handleOptionChange={handleOptionChange}
              handleOptionalFieldToggle={handleOptionalFieldToggle}
            />
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar - Fixed to viewport bottom */}
      <div className="fixed bottom-0 left-0 right-0 shadow-lg z-50" style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa)", borderTop: "3px solid #E5E7EB" }}>
        <div className="flex items-center justify-center gap-4 px-8 py-4">
          {/* Back Button */}
          <button
            onClick={handleClickBackStep}
            className="flex items-center gap-2 rounded-lg px-6 py-3 cursor-pointer transition-all hover:shadow-md"
            style={{ border: "2px solid #6B7280", backgroundColor: "#F3F4F6", color: "#374151" }}
          >
            <ArrowLeft size={18} />
            <span className="font-semibold">{step === 1 ? "Back to Collections" : "Back"}</span>
          </button>

          {/* Update Calculation Button */}
          {selectedCollection && step > 1 && step < steps.length && (
            <button
              onClick={handleUpdateCalculation}
              disabled={leadsLoading}
              className="flex items-center gap-2 rounded-lg px-6 py-3 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative"
              style={{ border: "2px solid #EA580C", backgroundColor: "#FFF7ED", color: "#EA580C" }}
              title="Update available volume calculation"
            >
              <RefreshCw size={18} className={leadsLoading ? "animate-spin" : ""} />
              <span className="font-semibold">Update Calculation</span>
              {unappliedChangesCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold text-white animate-pulse"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {unappliedChangesCount}
                </span>
              )}
            </button>
          )}

          {/* Skip to Checkout Button - Only show if not on checkout step or the step before checkout */}
          {selectedCollection && step < steps.length - 1 && (
            <button
              onClick={() => setStep(steps.length)}
              className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md"
              style={{ border: "2px solid #059669", backgroundColor: "#ECFDF5", color: "#059669" }}
            >
              <span className="font-semibold">Skip to Checkout</span>
              <ArrowRight size={18} />
            </button>
          )}

          {/* Next/Checkout Button */}
          {steps.length > 1 && paymentMethod !== "Credit Card" && (
            <button
              onClick={handleClickNextStep}
              disabled={orderLoading}
              className={`flex items-center gap-2 rounded-lg px-8 py-3 cursor-pointer transition-all font-semibold hover:shadow-lg ${
                step === steps.length
                  ? "flex-row-reverse shadow-md"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={
                step === steps.length
                  ? { backgroundColor: "#4040BF", color: "white", border: "2px solid #4040BF" }
                  : { border: "2px solid #4040BF", backgroundColor: "#EEF2FF", color: "#4040BF" }
              }
            >
              <span>
                {step === steps.length
                  ? orderLoading ? "Processing..." : "Confirm Orders"
                  : step === steps.length - 1
                  ? "Go to Checkout"
                  : "Next"}
              </span>
              {step === steps.length ? <Check size={18} /> : <ArrowRight size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
