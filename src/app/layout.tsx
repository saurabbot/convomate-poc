import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Convomate - AI-Powered Content Analysis",
  description: "Extract and analyze content from any URL with AI-powered insights and real-time conversation capabilities.",
  keywords: "AI, content analysis, URL processing, video conferencing, chat",
  authors: [{ name: "Convomate Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
