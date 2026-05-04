import './global.css';
import { Plus_Jakarta_Sans, Space_Grotesk, Inter } from "next/font/google";
import Providers from "./providers";
import ConditionalHeader from "../shared/widgets/Header/ConditionalHeader";
import ProductComparisonBar from "../shared/components/product-comparison/ProductComparisonBar";
import ServiceWorkerRegistrar from "../shared/components/ServiceWorkerRegistrar";
import type { Metadata } from "next";

const BASE_URL = "https://vettcode.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VETTCODE — Verified Codebases for Founders | Production-Ready Applications",
    template: "%s | VETTCODE",
  },
  description:
    "VETTCODE is the trusted marketplace for verified, production-ready applications. Built by developers, trusted by founders. Launch faster with secure, reliable codebases.",
  keywords: [
    "verified codebases",
    "production ready applications",
    "buy source code",
    "sell applications",
    "developer marketplace",
    "code marketplace",
    "ready-made applications",
    "SaaS templates",
    "web applications",
    "mobile apps",
    "startup tools",
    "founder resources",
    "vetted code",
    "secure applications",
    "enterprise applications",
    "VETTCODE",
    "code for founders",
    "application marketplace",
    "software marketplace",
    "pre-built applications",
    "verified applications",
    "trusted codebases",
    "developer tools",
    "startup applications",
    "business applications",
    "API marketplace",
    "backend services",
    "frontend templates",
    "full-stack applications",
  ],
  authors: [{ name: "VETTCODE", url: BASE_URL }],
  creator: "VETTCODE",
  publisher: "VETTCODE",
  category: "technology",
  classification: "Software, Development, Marketplace, Applications",
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
    locale: "en_US",
    url: BASE_URL,
    siteName: "VETTCODE",
    title: "VETTCODE — Verified Codebases for Founders",
    description:
      "Launch faster with production-ready, verified applications. Built by developers, trusted by founders. Secure, reliable, and ready to deploy.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VETTCODE — Verified Codebases for Founders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vettcode",
    creator: "@vettcode",
    title: "VETTCODE — Verified Codebases for Founders",
    description:
      "Production-ready applications for founders. Verified, secure, and ready to launch. Browse 1000+ applications.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VETTCODE",
  },
  verification: {
    google: "wy6SWm5sYCGw74GmMhddQF7GHpU6zJeTvv8bASt71fs",
    other: {
      "p:domain_verify": "11c00d055440528e074360f44e5303cb",
    },
  },
};


export const viewport = {
  themeColor: "#8b5cf6",
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
  name: "VETTCODE",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description: "Trusted marketplace for verified, production-ready applications. Built by developers, trusted by founders.",
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
  name: "VETTCODE",
  url: BASE_URL,
  description: "Verified codebases for founders — production-ready applications, secure and reliable. Launch faster with trusted code.",
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
