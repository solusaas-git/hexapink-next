import NumberInput from "@/components/common/Inputs/NumberInput";

interface PricingProps {
  fee: number;
  discount: number;
  setFee: (fee: number) => void;
  setDiscount: (discount: number) => void;
  disabled?: boolean;
}

export default function Pricing({
  fee,
  discount,
  disabled,
  setFee,
  setDiscount,
}: PricingProps) {
  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-raleway font-bold">
        Pricing
      </div>

      <div className="flex items-center gap-8 p-6">
        <NumberInput
          label="Base Fee Per Lead"
          value={fee}
          isCurrency={true}
          disabled={disabled ?? false}
          onChange={setFee}
          error=""
        />
        <NumberInput
          label="Discount Maximum"
          value={discount}
          isCurrency={true}
          disabled={disabled ?? false}
          onChange={setDiscount}
          error=""
        />
      </div>
    </div>
  );
}

