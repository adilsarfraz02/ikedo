
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
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Toaster />
        <NextTopLoader showSpinner={false} color='gold'
                     shadow='true'
        />
        <UiProviders
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange>
          {children}
        </UiProviders>
      </body>
    </html>
  );
}
