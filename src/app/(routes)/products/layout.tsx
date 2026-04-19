import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products — Electronics, Fashion, Home & More",
  description:
    "Browse thousands of products on EshopUG — Uganda's #1 online marketplace. Shop electronics, fashion, home goods, beauty, groceries, sports gear and more at the best prices with fast delivery.",
  keywords: [
    "buy products online Uganda",
    "online shopping Uganda",
    "electronics Uganda",
    "fashion Uganda",
    "home goods Uganda",
    "beauty products Uganda",
    "groceries Uganda",
    "affordable products Uganda",
    "Uganda online store",
    "best deals Uganda",
  ],
  openGraph: {
    title: "Shop All Products | EshopUG Uganda",
    description:
      "Thousands of products across electronics, fashion, home, beauty, groceries and more. Best prices in Uganda with fast delivery.",
    url: "https://eshopug.vercel.app/products",
    type: "website",
  },
  alternates: {
    canonical: "https://eshopug.vercel.app/products",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
