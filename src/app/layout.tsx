import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "24julex - Premium Anti-Tarnish Jewelry",
  description: "Discover stunning waterproof, anti-tarnish jewelry for Gen-Z fashion enthusiasts. Made in Salem, loved worldwide.",
  keywords: ["24julex", "jewelry", "anti-tarnish", "waterproof", "fashion", "Gen-Z", "gold", "silver"],
  authors: [{ name: "24julex Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "24julex - Premium Anti-Tarnish Jewelry",
    description: "Stunning waterproof, anti-tarnish jewelry for the modern Gen-Z fashion enthusiast",
    url: "https://24julex.com",
    siteName: "24julex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "24julex - Premium Anti-Tarnish Jewelry",
    description: "Stunning waterproof, anti-tarnish jewelry for the modern Gen-Z fashion enthusiast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-white text-deep-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
