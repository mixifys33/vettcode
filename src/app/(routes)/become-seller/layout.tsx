import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Seller — Start Selling Online in Worldwide",
  description:
    "Start your online business in Worldwide with EshopUG. List your products, reach thousands of buyers, and grow your sales. Free to join — become a seller today.",
  keywords: [
    "sell online Worldwide",
    "become seller Worldwide",
    "start online business Worldwide",
    "sell products Worldwide",
    "Worldwide online selling",
    "list products Worldwide",
    "Worldwide ecommerce seller",
    "online trading Worldwide",
    "online marketing Worldwide",
    "sell on EshopUG",
  ],
  openGraph: {
    title: "Become a Seller on EshopUG | Sell Online in Worldwide",
    description:
      "Join thousands of sellers on Trusted marketplace. List products, reach buyers, grow your business.",
    url: "https://eshopug.vercel.app/become-seller",
    type: "website",
  },
  alternates: {
    canonical: "https://eshopug.vercel.app/become-seller",
  },
};

export default function BecomeSellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

