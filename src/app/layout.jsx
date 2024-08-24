"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import UiProviders from "@/lib/UiProviders";
import { Toaster } from "react-hot-toast";
import "@uploadthing/react/styles.css";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Toaster />
        <NextTopLoader showSpinner='false' />
        <UiProviders
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange>
          {children}
        </UiProviders>
      </body>
    </html>
  );
}
