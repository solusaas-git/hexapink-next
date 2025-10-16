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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
