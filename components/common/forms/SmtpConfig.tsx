"use client";

import { useEffect, useState, useMemo } from "react";
import Input from "@/components/common/Inputs/Input";
import Checkbox from "@/components/common/ui/Checkbox";
import { PiEyeLight, PiEyeSlash } from "react-icons/pi";
import { SmtpConfigType } from "@/types";

interface SmtpConfigProps {
  smtpType: string;
  smtpData: SmtpConfigType | null;
  onSave: (config: SmtpConfigType & { smtpType: string }) => void;
}

const initialSmtpConfig: SmtpConfigType = {
  host: "",
  port: "",
  fromName: "",
  fromEmail: "",
  userName: "",
  password: "",
  secure: true,
  replyTo: "",
};

export default function SmtpConfig({
  smtpType,
  smtpData,
  onSave,
}: SmtpConfigProps) {
  const [smtpConfig, setSmtpConfig] =
    useState<SmtpConfigType>(initialSmtpConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Add saving state

  const isConfigChanged = useMemo(() => {
    return JSON.stringify(smtpConfig) !== JSON.stringify({ ...initialSmtpConfig, ...smtpData });
  }, [smtpConfig, smtpData]);

  useEffect(() => {
    if (smtpData === null) {
      setSmtpConfig(initialSmtpConfig);
    } else {
      setSmtpConfig({ ...initialSmtpConfig, ...smtpData }); // Reset to initialSmtpConfig before applying smtpData
    }
  }, [smtpData, smtpType]); // Added smtpType as a dependency

  const handleInputChange = (
    key: string,
    value: string | number | boolean | null
  ) => {
    setSmtpConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true); // Set saving to true
    try {
      await onSave({ ...smtpConfig, smtpType });
    } finally {
      setIsSaving(false); // Set saving to false
    }
  };

  return (
    <div className="max-w-4xl flex flex-col gap-4">
      <p className="text-left text-xl py-4 font-bold">
        Configuring SMTP for {smtpType}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
        <div className="flex flex-col gap-4">
          <Input
            label="Host"
            type="text"
            value={smtpConfig.host}
            onChange={(e) => handleInputChange("host", e.target.value)}
            error=""
          />
          <Input
            label="Port"
            type="number"
            value={smtpConfig.port}
            onChange={(e) => handleInputChange("port", e.target.value)}
            error=""
          />
          <Input
            label="User Name"
            type="text"
            value={smtpConfig.userName}
            onChange={(e) => handleInputChange("userName", e.target.value)}
            error=""
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={smtpConfig.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error=""
            />
            {showPassword ? (
              <PiEyeSlash
                onClick={() => setShowPassword(false)}
                className="absolute right-3 top-1/2 transform text-xl text-gray-500 cursor-pointer"
              />
            ) : (
              <PiEyeLight
                onClick={() => setShowPassword(true)}
                className="absolute right-3 top-1/2 transform text-xl text-gray-500 cursor-pointer"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            label="From Email"
            type="email"
            value={smtpConfig.fromEmail}
            onChange={(e) => handleInputChange("fromEmail", e.target.value)} // Fixed key
            error=""
          />
          <Input
            label="From Name"
            type="text"
            value={smtpConfig.fromName}
            onChange={(e) => handleInputChange("fromName", e.target.value)}
            error=""
          />
          <Input
            label="Reply-To Email"
            type="email"
            value={smtpConfig.replyTo}
            onChange={(e) => handleInputChange("replyTo", e.target.value)}
            error=""
          />
          <div className="flex items-center gap-2 mt-6">
            <Checkbox
              checked={smtpConfig.secure}
              onChange={(value) => handleInputChange("secure", value)}
            />
            <label className="text-sm text-light-dark font-medium">
              Secure (SSL)
            </label>
          </div>
        </div>
      </div>
      {isConfigChanged && ( // Show button only if config has changed
        <button
          onClick={handleSave}
          disabled={isSaving} // Disable button while saving
          className={`mt-4 px-6 py-2 rounded-lg transition ${
            isSaving
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-dark-blue text-white hover:bg-blue-800"
          }`}
        >
          {isSaving ? "Saving..." : "Save SMTP Configuration"}
        </button>
      )}
    </div>
  );
}
