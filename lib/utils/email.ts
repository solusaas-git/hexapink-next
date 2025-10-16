import nodemailer from "nodemailer";
import SMTP from "@/lib/models/SMTP";

interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}

// Helper to create a transporter
const createTransporter = async (type: "Primary" | "Failover") => {
  const smtpConfig = await SMTP.findOne({ type });
  if (!smtpConfig) {
    throw new Error(`${type} SMTP configuration not found`);
  }
  if (!smtpConfig.fromEmail || !smtpConfig.password) {
    throw new Error(`${type} SMTP credentials are missing`);
  }
  return {
    transporter: nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.fromEmail,
        pass: smtpConfig.password,
      },
    }),
    from: `${smtpConfig.fromName} <${smtpConfig.userName}>`,
  };
};

/**
 * Sends an email using the primary SMTP server, and falls back to the failover SMTP server if the primary fails.
 * Optionally prioritizes the failover SMTP server.
 * @param {Object} mailOptions - The email options (to, from, subject, html, attachments, etc.).
 * @param {boolean} useFailover - If true, prioritize the failover SMTP server.
 */
export const sendEmailWithFailover = async (
  mailOptions: MailOptions,
  useFailover: boolean = false
) => {
  const sendWithTransporter = async (type: "Primary" | "Failover") => {
    console.log(`Sending email using ${type} SMTP server...`);
    const { transporter, from } = await createTransporter(type);
    await transporter.sendMail({ ...mailOptions, from });
  };

  try {
    await sendWithTransporter(useFailover ? "Failover" : "Primary");
  } catch (error: any) {
    console.error(
      `${useFailover ? "Failover" : "Primary"} SMTP server failed:`,
      error.message
    );
    if (!useFailover) {
      try {
        await sendWithTransporter("Failover");
        console.log("Email sent using failover SMTP server.");
      } catch (failoverError: any) {
        console.error("Failover SMTP server also failed:", failoverError.message);
        throw new Error("Both primary and failover SMTP servers failed.");
      }
    } else {
      try {
        await sendWithTransporter("Primary");
        console.log("Email sent using primary SMTP server.");
      } catch (primaryError: any) {
        console.error("Primary SMTP server also failed:", primaryError.message);
        throw new Error("Both primary and failover SMTP servers failed.");
      }
    }
  }
};

