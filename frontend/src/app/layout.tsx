import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bohuroopi | Premium Fashion Jewellery Online",
  description: "Shop the latest collection of trendy earrings, necklaces, and rings.",
  keywords: ["jewellery", "fashion", "earrings", "artificial jewellery", "online shopping India"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-myntra-dark`}>
        {children}
      </body>
    </html>
  );
}
