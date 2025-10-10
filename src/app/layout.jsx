
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
export const  metadata = {
    description: "Ikedo live is a referral and earn website that helps you maximize your referrals and earnings.",
    title: "Ikedo live | A Earn and Referral website",
    image: "./favicon.png",
    url: "https://www.ikedo.live",
    keywords: "referral ikedo, Ikedo live, ikedo, ikedopro, ikedo.live, earnings,ikedo,pro,referral,earnings,refer,referral and earn",
    siteName: "Ikedo live",
    type: "website",
    locale: "en_US",
    robots: "index, follow",
    og: {
      title: "Ikedo live",
      description: "Ikedo live is a referral and earn website that helps you maximize your referrals and earnings.",
      image: "https://ikedo.live/favicon.png",
      url: "https://www.ikedo.live",
      type: "website",
      siteName: "Ikedo live",
    },

}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`light ${inter.className}`}>
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Toaster />
        <NextTopLoader showSpinner={false} color='gold' />
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
