import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // added broader range just in case
  variable: "--font-dm-sans",
});

import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Expenza — Corporate Expense Reimbursement",
  description: "Expenza: Eliminate the friction from corporate spending. Fully automated reimbursements, AI-powered receipts, and instant multi-tier approvals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body bg-cream text-dark antialiased`}
      >
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-body font-bold text-sm shadow-md border border-sand',
              style: {
                background: '#FAF7F2',
                color: '#1A1A2E',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
