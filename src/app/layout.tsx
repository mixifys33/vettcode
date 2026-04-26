import './global.css';
import { Plus_Jakarta_Sans, Space_Grotesk, Inter } from "next/font/google";
import Providers from "./providers";
import ConditionalHeader from "../shared/widgets/Header/ConditionalHeader";
import ProductComparisonBar from "../shared/components/product-comparison/ProductComparisonBar";
import ServiceWorkerRegistrar from "../shared/components/ServiceWorkerRegistrar";
import type { Metadata } from "next";

const BASE_URL = "https://eshopug.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "EshopUG — Uganda's #1 Online Marketplace | Shop Electronics, Fashion & More",
    template: "%s | Eshop Uganda",
  },
  description:
    "Eshop is Uganda's leading online shopping marketplace. Buy and sell electronics, fashion, home goods, beauty products, groceries and more. Fast delivery, secure payments, best prices in Uganda.",
  keywords: [
    "online shopping Uganda",
    "Uganda marketplace",
    "buy online Uganda",
    "sell online Uganda",
    "Uganda ecommerce",
    "shopping Uganda",
    "online store Uganda",
    "Uganda products",
    "electronics Uganda",
    "fashion Uganda",
    "home goods Uganda",
    "groceries Uganda",
    "online trading Uganda",
    "online selling Uganda",
    "online marketing Uganda",
    "best prices Uganda",
    "Uganda online market",
    "buy and sell Uganda",
    "Uganda shop",
    "eshop Uganda",
    "easyshop Uganda",
    "eshopug",
    "kampala online shopping",
    "Uganda delivery",
    "affordable products Uganda",
    "Uganda deals",
    "Uganda offers",
    "product marketplace Africa",
    "African ecommerce",
    "online shopping Africa",
  ],
  authors: [{ name: "EshopUG", url: BASE_URL }],
  creator: "EshopUG",
  publisher: "EshopUG",
  category: "shopping",
  classification: "Shopping, Marketplace, Ecommerce",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: BASE_URL,
    siteName: "EshopUG",
    title: "EshopUG — Uganda's #1 Online Marketplace",
    description:
      "Shop electronics, fashion, home goods, beauty, groceries and more on EshopUG — Uganda's leading online marketplace. Best prices, fast delivery, secure payments.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EshopUG — Uganda's #1 Online Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@eshopug",
    creator: "@eshopug",
    title: "EshopUG — Uganda's #1 Online Marketplace",
    description:
      "Buy and sell online in Uganda. Electronics, fashion, home goods, beauty & more. Fast delivery, secure payments.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EshopUG",
  },
  verification: {
    google: "uyQ0T2p-Td4LjPOJviJiIx-WMe51mXmhklau6-sBhWM",
    other: {
      "p:domain_verify": "11c00d055440528e074360f44e5303cb",
    },
  },
};


export const viewport = {
  themeColor: "#0d3f4d",
};

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EshopUG",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description: "Uganda's leading online marketplace for electronics, fashion, home goods, beauty, groceries and more.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EshopUG",
  url: BASE_URL,
  description: "Uganda's #1 online marketplace — buy and sell electronics, fashion, home goods, beauty, groceries and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        <Providers>
          <ConditionalHeader />
          <ServiceWorkerRegistrar />
          {children}
          <ProductComparisonBar />
        </Providers>
      </body>
    </html>
  );
}
