import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Seller — Start Selling Online in Uganda",
  description:
    "Start your online business in Uganda with EshopUG. List your products, reach thousands of buyers, and grow your sales. Free to join — become a seller today.",
  keywords: [
    "sell online Uganda",
    "become seller Uganda",
    "start online business Uganda",
    "sell products Uganda",
    "Uganda online selling",
    "list products Uganda",
    "Uganda ecommerce seller",
    "online trading Uganda",
    "online marketing Uganda",
    "sell on EshopUG",
  ],
  openGraph: {
    title: "Become a Seller on EshopUG | Sell Online in Uganda",
    description:
      "Join thousands of sellers on Uganda's #1 marketplace. List products, reach buyers, grow your business.",
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
