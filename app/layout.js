import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "@liveblocks/react-ui/styles.css";
const inter = Outfit({ subsets: ["latin"] });


export const metadata = {
  title: "Quick Collab",
  description: "AI Powered Document editing and collaboration platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
    <link rel="icon" href="/favicon.ico" />
      <body className={inter.className}>
      <Toaster />
      {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
