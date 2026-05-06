import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse All Applications — Web Apps, Mobile Apps, APIs & More",
  description:
    "Browse thousands of verified applications on VETTCODE — the trusted marketplace for production-ready code. Shop web applications, mobile apps, SaaS templates, APIs, and more at the best prices with instant access.",
  keywords: [
    "buy applications online",
    "production ready apps",
    "web applications",
    "mobile applications",
    "SaaS templates",
    "API marketplace",
    "verified codebases",
    "affordable applications",
    "developer marketplace",
    "best code deals",
  ],
  openGraph: {
    title: "Browse All Applications | VETTCODE",
    description:
      "Thousands of verified applications across web, mobile, SaaS, APIs and more. Best prices with instant access.",
    url: "https://vettcode.vercel.app/products",
    type: "website",
  },
  alternates: {
    canonical: "https://vettcode.vercel.app/products",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

