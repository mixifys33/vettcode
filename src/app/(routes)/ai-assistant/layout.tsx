import { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-AI - vettcode AI Assistant",
  description: "Get instant help finding products, comparing prices, and making smart shopping decisions with Easy-AI.",
};

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
