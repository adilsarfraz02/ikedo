
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
//     website name is ikedo.pro  is referral and earn website create title and description and seo tags and keyword
    description: "Ikedo Pro is a referral and earn website that helps you maximize your referrals and earnings.",
    title: "Ikedo Pro",
    image: "https://ikedo.pro/favicon.png",
    url: "https://www.ikedo.pro",
    keywords: "referral, ikedo pro, ikedo, ikedopro, ikedo.pro, earnings,ikedo,pro,referral,earnings,refer,referral and earn",
    siteName: "Ikedo Pro",
    type: "website",
    locale: "en_US",
    robots: "index, follow",
    themeColor: "#ffcc00",
    backgroundColor: "#f9f9f9",
    og: {
      title: "Ikedo Pro",
      description: "Ikedo Pro is a referral and earn website that helps you maximize your referrals and earnings.",
      image: "https://ikedo.pro/favicon.png",
      url: "https://www.ikedo.pro",
      type: "website",
      siteName: "Ikedo Pro",
    },

}

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
