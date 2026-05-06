import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Developer Shops & Verified Sellers",
  description:
    "Discover verified developers and sellers on VETTCODE. Find trusted creators selling production-ready applications, templates, APIs, and more.",
  keywords: [
    "developer shops",
    "verified sellers",
    "code sellers",
    "application developers",
    "trusted developers",
    "VETTCODE sellers",
    "marketplace sellers",
  ],
  openGraph: {
    title: "Browse Developer Shops & Sellers | VETTCODE",
    description:
      "Find trusted developers and sellers. Production-ready applications, templates, APIs and more.",
    url: "https://vettcode.vercel.app/shops",
    type: "website",
  },
  alternates: {
    canonical: "https://vettcode.vercel.app/shops",
  },
};

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

