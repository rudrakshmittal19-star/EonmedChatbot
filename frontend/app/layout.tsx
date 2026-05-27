import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediAssist AI",
  description: "Your personal AI health companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, sans-serif", height: "100vh", overflow: "hidden", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
