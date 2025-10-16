import type { Metadata } from "next";
import { Kanit, Raleway } from "next/font/google";
import "./globals.css";
import "./index.css";
import "./styles/button.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "@/contexts/UserContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { PageLoader } from "@/components/common/ui";

const kanit = Kanit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-kanit",
});

const raleway = Raleway({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Hexapink - Lead Generation Platform",
  description: "Professional B2B lead generation and data enrichment platform",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo.webp", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.hexapink.com https://hexapink.com https://*.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://www.hexapink.com https://hexapink.com https://challenges.cloudflare.com https://*.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'"
        />
        {/* Force favicon refresh with cache busting */}
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/webp" href="/logo.webp?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
      </head>
      <body
        className={`${kanit.variable} ${raleway.variable} antialiased`}
        suppressHydrationWarning
      >
        <UserProvider>
          <CurrencyProvider>
            <PageLoader />
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick={true}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Flip}
              className="custom-toast-container"
              toastClassName="custom-toast"
              progressClassName="custom-toast-progress"
            />
            {children}
          </CurrencyProvider>
        </UserProvider>
      </body>
    </html>
  );
}
