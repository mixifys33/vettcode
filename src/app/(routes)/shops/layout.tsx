import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Online Shops & Sellers in Uganda",
  description:
    "Discover verified sellers and online shops on EshopUG. Find trusted stores selling electronics, fashion, food, beauty products and more across Uganda.",
  keywords: [
    "online shops Uganda",
    "Uganda sellers",
    "verified sellers Uganda",
    "Uganda stores online",
    "buy from sellers Uganda",
    "Uganda marketplace sellers",
    "trusted shops Uganda",
  ],
  openGraph: {
    title: "Browse Online Shops & Sellers | EshopUG Uganda",
    description:
      "Find trusted sellers and shops across Uganda. Electronics, fashion, food, beauty and more.",
    url: "https://eshopug.vercel.app/shops",
    type: "website",
  },
  alternates: {
    canonical: "https://eshopug.vercel.app/shops",
  },
};

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
