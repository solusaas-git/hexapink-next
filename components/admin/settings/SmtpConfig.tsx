"use client";

import { useEffect, useState } from "react";
import { PiEyeLight, PiEyeSlash } from "react-icons/pi";
import Input from "@/components/common/Inputs/Input";
import Checkbox from "@/components/common/ui/Checkbox";
import { toast } from "react-toastify";

interface SmtpConfigType {
  host: string;
  port: string;
  fromName: string;
  fromEmail: string;
  userName: string;
  password: string;
  secure: boolean;
  replyTo: string;
}

interface SmtpConfigProps {
  smtpType: string;
  smtpData: SmtpConfigType | null;
  onSave: (config: SmtpConfigType) => void;
}

const initialSmtpConfig: SmtpConfigType = {
  host: "",
  port: "587",
  fromName: "",
  fromEmail: "",
  userName: "",
  password: "",
  secure: true,
  replyTo: "",
};

export default function SmtpConfig({ smtpType, smtpData, onSave }: SmtpConfigProps) {
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigType>(initialSmtpConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (smtpData === null) {
      setSmtpConfig(initialSmtpConfig);
    } else {
      setSmtpConfig({ ...initialSmtpConfig, ...smtpData });
    }
  }, [smtpData, smtpType]);

  const handleInputChange = (key: string, value: string | boolean) => {
    setSmtpConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.fromEmail) {
      toast.error("Host, Port, and From Email are required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(smtpConfig);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-light-gray-3 rounded-lg p-8">
      <h3 className="text-lg font-bold text-dark mb-6">{smtpType} SMTP Configuration</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Host"
            type="text"
            value={smtpConfig.host}
            onChange={(e) => handleInputChange("host", e.target.value)}
            placeholder="smtp.gmail.com"
          />
          <Input
            label="Port"
            type="text"
            value={smtpConfig.port}
            onChange={(e) => handleInputChange("port", e.target.value)}
            placeholder="587"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="From Name"
            type="text"
            value={smtpConfig.fromName}
            onChange={(e) => handleInputChange("fromName", e.target.value)}
            placeholder="HexaPink"
          />
          <Input
            label="From Email"
            type="email"
            value={smtpConfig.fromEmail}
            onChange={(e) => handleInputChange("fromEmail", e.target.value)}
            placeholder="noreply@hexapink.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            type="text"
            value={smtpConfig.userName}
            onChange={(e) => handleInputChange("userName", e.target.value)}
            placeholder="username@gmail.com"
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={smtpConfig.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <PiEyeSlash className="text-xl" /> : <PiEyeLight className="text-xl" />}
            </button>
          </div>
        </div>

        <Input
          label="Reply To"
          type="email"
          value={smtpConfig.replyTo}
          onChange={(e) => handleInputChange("replyTo", e.target.value)}
          placeholder="support@hexapink.com"
        />

        <div className="flex items-center gap-2">
          <Checkbox
            checked={smtpConfig.secure}
            onChange={(checked) => handleInputChange("secure", checked)}
          />
          <label className="text-sm font-semibold text-gray-700">
            Use Secure Connection (TLS/SSL)
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-dark-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 mt-6"
        >
          {isSaving ? "Saving..." : "Save SMTP Configuration"}
        </button>
      </div>
    </div>
  );
}

