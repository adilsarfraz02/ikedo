"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import UiProviders from "@/lib/UiProviders";
import { Toaster } from "react-hot-toast";
import "@uploadthing/react/styles.css";
import NextTopLoader from "nextjs-toploader";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Toaster />
        <NextTopLoader showSpinner={false} />
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
