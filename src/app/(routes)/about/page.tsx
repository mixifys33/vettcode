import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin, ShieldCheck, Truck, Users, Star, TrendingUp,
  Phone, Mail, Globe, CheckCircle, Heart, Zap, Award,
  ShoppingBag, Store, Clock, ArrowRight,
} from "lucide-react";

const BASE_URL = "https://eshopug.vercel.app";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "About EshopUG — Uganda's Trusted Online Marketplace | Kasese District",
  description:
    "EshopUG is Uganda's most trusted online marketplace, proudly serving Kasese District and all of Uganda. Buy and sell electronics, fashion, home goods, groceries and more. Fast delivery, secure payments, verified sellers.",
  keywords: [
    "EshopUG about",
    "online shopping Kasese",
    "Kasese marketplace",
    "Kasese online store",
    "buy online Kasese Uganda",
    "sell online Kasese",
    "Kasese District ecommerce",
    "Uganda online marketplace",
    "trusted online shop Uganda",
    "EshopUG Kasese",
    "online shopping western Uganda",
    "Kasese electronics shop",
    "Kasese fashion shop",
    "Uganda ecommerce platform",
    "buy and sell Uganda",
    "verified sellers Uganda",
    "secure online payments Uganda",
    "fast delivery Uganda",
    "Kasese delivery",
    "western Uganda shopping",
  ],
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: `${BASE_URL}/about`,
    siteName: "EshopUG",
    title: "About EshopUG — Uganda's Trusted Online Marketplace | Kasese District",
    description:
      "Proudly serving Kasese District and all of Uganda. EshopUG connects buyers and sellers across Uganda with secure payments, fast delivery, and verified products.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "EshopUG — About Us" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About EshopUG — Uganda's Trusted Online Marketplace",
    description: "Proudly serving Kasese District and all of Uganda. Shop electronics, fashion, home goods and more.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

// ─── Structured Data ──────────────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EshopUG",
  alternateName: "Eshop Uganda",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description:
    "EshopUG is Uganda's leading online marketplace, proudly headquartered in Kasese District, Western Uganda. We connect buyers and sellers across Uganda with secure payments, fast delivery, and verified products.",
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    name: "Kasese District, Western Uganda",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kasese",
      addressRegion: "Western Uganda",
      addressCountry: "UG",
    },
  },
  areaServed: {
    "@type": "Country",
    name: "Uganda",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+256-761-819-885",
      contactType: "customer service",
      availableLanguage: ["English"],
      areaServed: "UG",
    },
  ],
  sameAs: [],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "EshopUG",
  description: "Uganda's trusted online marketplace serving Kasese District and all of Uganda",
  url: BASE_URL,
  telephone: "+256761819885",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kasese",
    addressRegion: "Western Uganda",
    addressCountry: "UG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "0.1833",
    longitude: "30.0833",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  priceRange: "UGX",
  currenciesAccepted: "UGX",
  paymentAccepted: "Mobile Money, Cash on Delivery",
};

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50,000+", label: "Happy Shoppers", icon: Users },
  { value: "120,000+", label: "Products Listed", icon: ShoppingBag },
  { value: "500+", label: "Verified Sellers", icon: Store },
  { value: "4.8★", label: "Average Rating", icon: Star },
];

// ─── Values ───────────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Security",
    desc: "Every seller is verified. Every payment is secured. We protect both buyers and sellers with our robust trust system.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "We partner with reliable delivery services across Uganda — from Kasese to Kampala, your order arrives on time.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Heart,
    title: "Community First",
    desc: "Born in Kasese, built for Uganda. We empower local businesses and entrepreneurs to reach customers nationwide.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Innovation",
    desc: "From AI-powered shopping assistance to real-time order tracking, we use technology to make shopping effortless.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    desc: "Products are reviewed and rated by real buyers. Our quality standards ensure you always get what you paid for.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Growth for Sellers",
    desc: "We give sellers the tools to grow — analytics, marketing, bulk upload, and access to thousands of buyers.",
    color: "from-teal-500 to-[#115061]",
  },
];

// ─── Team ─────────────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Masereka Adorable Kimulya",
    role: "Founder & CEO",
    location: "Kasese District, Uganda",
    bio: "Visionary entrepreneur from Kasese who built EshopUG to empower Ugandan businesses and connect communities through technology.",
    initials: "MAK",
    gradient: "from-[#115061] to-teal-600",
  },
];

// ─── Why Kasese ───────────────────────────────────────────────────────────────
const KASESE_POINTS = [
  "Kasese District is a major commercial hub in Western Uganda",
  "Home to thousands of traders, farmers, and entrepreneurs",
  "Gateway to Queen Elizabeth National Park — tourism drives commerce",
  "Rich in minerals, agriculture, and growing tech adoption",
  "EshopUG was founded here to serve the local community first",
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="min-h-screen bg-gray-50">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3f4d] via-[#115061] to-teal-700 text-white">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 rounded-full px-5 py-2 text-amber-300 text-sm font-semibold mb-6">
              <MapPin className="w-4 h-4" />
              Proudly from Kasese District, Uganda
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Uganda&apos;s Most{" "}
              <span className="text-amber-400">Trusted</span>{" "}
              Online Marketplace
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              EshopUG was born in <strong className="text-amber-300">Kasese District</strong> with a simple mission —
              to make buying and selling online accessible, safe, and affordable for every Ugandan.
              From Kasese to Kampala, we connect communities through commerce.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-teal-900 font-black px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
              <Link
                href="/become-seller"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
              >
                <Store className="w-5 h-5" />
                Become a Seller
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
                <div className="w-12 h-12 bg-[#115061]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-[#115061]" />
                </div>
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
                Built in Kasese,<br />Built for Uganda
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  EshopUG was founded in <strong>Kasese District, Western Uganda</strong> — a vibrant commercial
                  hub at the foot of the Rwenzori Mountains. We saw a gap: local businesses had great products
                  but limited reach, and buyers had limited access to quality goods at fair prices.
                </p>
                <p>
                  We built EshopUG to bridge that gap. Starting from Kasese, we&apos;ve grown into a nationwide
                  platform serving buyers and sellers across all regions of Uganda — from Kampala to Gulu,
                  Mbarara to Mbale.
                </p>
                <p>
                  Today, EshopUG is Uganda&apos;s fastest-growing online marketplace, powered by AI technology,
                  secure mobile money payments, and a community of thousands of verified sellers and happy shoppers.
                </p>
              </div>
            </div>

            {/* Kasese focus card */}
            <div className="bg-gradient-to-br from-[#0d3f4d] to-teal-700 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-teal-900" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Kasese District</h3>
                  <p className="text-white/70 text-sm">Western Uganda — Our Home</p>
                </div>
              </div>
              <ul className="space-y-3">
                {KASESE_POINTS.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/85">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <Globe className="w-4 h-4" />
                Serving all 135 districts of Uganda
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">What Drives Us</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Mission &amp; Vision</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#115061]/5 to-teal-50 rounded-2xl p-8 border border-[#115061]/10">
                <div className="w-14 h-14 bg-[#115061] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower every Ugandan — from a small trader in Kasese to a large retailer in Kampala —
                  with the tools, technology, and marketplace to grow their business and access quality products
                  at fair prices, safely and conveniently.
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
                <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-teal-900" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become East Africa&apos;s most trusted digital marketplace — where every community,
                  starting from Kasese District, has equal access to commerce, opportunity, and economic growth
                  through technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">What We Stand For</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">The People Behind EshopUG</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Our Leadership</h2>
            </div>
            <div className="flex justify-center">
              {TEAM.map(({ name, role, location, bio, initials, gradient }) => (
                <div key={name} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-sm w-full text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-white font-black text-xl">{initials}</span>
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">{name}</h3>
                  <p className="text-[#115061] font-semibold text-sm mt-1">{role}</p>
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-1 mb-4">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY TRUST US ── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">Why Choose EshopUG</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Why Ugandans Trust Us</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Verified Sellers Only", desc: "Every seller goes through a verification process. No fake shops, no scams — just genuine businesses." },
              { icon: Clock, title: "24/7 Platform Availability", desc: "Shop anytime, anywhere. Our platform is always online so you never miss a deal." },
              { icon: Truck, title: "Nationwide Delivery", desc: "We deliver to all major towns and districts across Uganda, including Kasese, Kampala, Mbarara, and more." },
              { icon: Phone, title: "Local Support", desc: "Our support team is based in Uganda and understands your needs. We speak your language." },
              { icon: Star, title: "Real Reviews", desc: "All product reviews come from verified buyers. What you see is what real customers experienced." },
              { icon: Zap, title: "AI-Powered Shopping", desc: "Our EshopAI assistant helps you find the perfect product, track orders, and get instant answers." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#115061]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#115061]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-[#115061] uppercase tracking-widest">Get In Touch</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Contact Us</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Have a question, partnership inquiry, or want to become a seller? We&apos;d love to hear from you.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <a
                href="tel:+256761819885"
                className="flex flex-col items-center gap-3 bg-[#115061]/5 hover:bg-[#115061]/10 border border-[#115061]/10 rounded-2xl p-6 text-center transition-colors group"
              >
                <div className="w-12 h-12 bg-[#115061] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Call / WhatsApp</p>
                  <p className="text-[#115061] font-semibold text-sm mt-1">+256 761 819 885</p>
                </div>
              </a>
              <a
                href="mailto:support@eshopug.com"
                className="flex flex-col items-center gap-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-2xl p-6 text-center transition-colors group"
              >
                <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-teal-900" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Email Us</p>
                  <p className="text-amber-600 font-semibold text-sm mt-1">support@eshopug.com</p>
                </div>
              </a>
              <div className="flex flex-col items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Location</p>
                  <p className="text-gray-500 font-medium text-sm mt-1">Kasese District,<br />Western Uganda</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0d3f4d] via-[#115061] to-teal-700 rounded-3xl p-10 text-white text-center shadow-2xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-400/10 rounded-full" />
            </div>
            <div className="relative z-10">
              <ShoppingBag className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-3">Ready to Shop or Sell?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Join thousands of Ugandans already buying and selling on EshopUG.
                It&apos;s free, fast, and trusted.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/products"
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-teal-900 font-black px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Browse Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/become-seller"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-all"
                >
                  <Store className="w-5 h-5" />
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
