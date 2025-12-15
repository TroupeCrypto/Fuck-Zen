import React from "react";
import "./globals.css";

export const metadata = {
  title: "Troupe War Room",
  description: "Executive roundtable and digital HQ"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
