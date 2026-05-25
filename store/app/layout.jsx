import "./globals.css";
import { Montserrat } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  fallback: ["system-ui", "sans-serif"]
});

export const metadata = {
  title: "Yash Collection",
  description: "Custom T-shirt brand platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-background text-text-primary`}>
        <ToastProvider>
          <div className="mx-auto flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-container flex-1 pb-24 lg:pb-8">{children}</main>
            <BottomNav />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
