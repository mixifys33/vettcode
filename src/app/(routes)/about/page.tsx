import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2, ShieldCheck, Zap, Users, Star, TrendingUp,
  Mail, Globe, CheckCircle, Heart, Award, Sparkles,
  Package, Clock, ArrowRight, Download, Rocket, Terminal,
  GitBranch, Database, Cpu, Lock, BarChart
} from "lucide-react";

const BASE_URL = "https://vettcode.vercel.app";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "About VETTCODE — The World's Premier Application Marketplace",
  description:
    "VETTCODE is the world's most trusted marketplace for production-ready applications and verified codebases. Buy and sell web apps, mobile apps, SaaS platforms, APIs, and more. Instant access, verified code, secure transactions.",
  keywords: [
    "VETTCODE about",
    "application marketplace",
    "buy applications online",
    "sell applications",
    "production-ready code",
    "verified codebases",
    "SaaS marketplace",
    "web app marketplace",
    "mobile app marketplace",
    "API marketplace",
    "developer marketplace",
    "code marketplace",
    "application store",
    "software marketplace",
    "vetted applications",
    "secure code purchase",
    "instant application access",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${BASE_URL}/about`,
    siteName: "VETTCODE",
    title: "About VETTCODE — The World's Premier Application Marketplace",
    description:
      "The trusted marketplace for production-ready applications. VETTCODE connects developers and businesses with verified, high-quality codebases and applications.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "VETTCODE — About Us" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About VETTCODE — The World's Premier Application Marketplace",
    description: "The trusted marketplace for production-ready applications and verified codebases.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

// ─── Structured Data ──────────────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VETTCODE",
  alternateName: "VETTCODE Marketplace",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description:
    "VETTCODE is the world's leading marketplace for production-ready applications and verified codebases. We connect developers, entrepreneurs, and businesses with high-quality, vetted applications.",
  foundingDate: "2024",
  areaServed: {
    "@type": "Place",
    name: "Worldwide",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "support@vettcode.com",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  ],
  sameAs: [],
};

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "10,000+", label: "Developers", icon: Users },
  { value: "5,000+", label: "Applications", icon: Package },
  { value: "500+", label: "Verified Sellers", icon: ShieldCheck },
  { value: "4.9★", label: "Average Rating", icon: Star },
];

// ─── Values ───────────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified Code Quality",
    desc: "Every application is thoroughly vetted for security, performance, and code quality. We ensure you get production-ready code, not prototypes.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Zap,
    title: "Instant Access",
    desc: "Download immediately after purchase. No waiting, no delays. Get your application files and documentation instantly.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Heart,
    title: "Developer First",
    desc: "Built by developers, for developers. We understand your needs and provide the tools, support, and marketplace to help you succeed.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    desc: "From AI-powered code search to intelligent recommendations, we use cutting-edge technology to help you find the perfect application.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    desc: "Applications are reviewed by real developers. Our rigorous standards ensure every codebase meets professional production standards.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Growth for Sellers",
    desc: "We empower sellers with analytics, marketing tools, and access to thousands of buyers. Turn your code into a sustainable business.",
    color: "from-teal-500 to-cyan-600",
  },
];

// ─── Why VETTCODE ─────────────────────────────────────────────────────────────
const VETTCODE_POINTS = [
  "Every application is vetted for security vulnerabilities",
  "Production-ready code with comprehensive documentation",
  "Instant access to source code and assets",
  "Regular updates and seller support included",
  "Built by experienced developers and verified by experts",
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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
            {/* Code pattern background */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: "50px 50px"
            }} />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-5 py-2 text-purple-300 text-sm font-semibold mb-6 backdrop-blur-sm">
              <Code2 className="w-4 h-4" />
              The Premier Application Marketplace
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Where Developers Find{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Production-Ready
              </span>{" "}
              Applications
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              VETTCODE is the world's most trusted marketplace for <strong className="text-purple-300">verified applications</strong> and 
              production-ready codebases. From web apps to mobile solutions, SaaS platforms to APIs — 
              we connect developers and businesses with high-quality, vetted code.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/applications"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                <Package className="w-5 h-5" />
                Browse Applications
              </Link>
              <Link
                href="/become-seller"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm"
              >
                <Rocket className="w-5 h-5" />
                Sell Your Code
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-purple-500/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-6 leading-tight">
                Built by Developers,<br />For Developers
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  VETTCODE was founded with a clear vision: to create a <strong className="text-purple-400">trusted marketplace</strong> where 
                  developers can buy and sell production-ready applications with confidence. We saw talented developers 
                  building amazing applications but struggling to monetize their work.
                </p>
                <p>
                  We built VETTCODE to solve that problem. Every application on our platform goes through rigorous 
                  vetting for security, code quality, and functionality. We don't just list code — we verify it meets 
                  professional production standards.
                </p>
                <p>
                  Today, VETTCODE is the world's fastest-growing application marketplace, powered by AI-driven search, 
                  secure transactions, and a community of thousands of developers and businesses building the future of software.
                </p>
              </div>
            </div>

            {/* Why VETTCODE card */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-8 text-white shadow-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Why VETTCODE?</h3>
                  <p className="text-purple-300 text-sm">The Standard for Quality Code</p>
                </div>
              </div>
              <ul className="space-y-3">
                {VETTCODE_POINTS.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-purple-500/20 flex items-center gap-2 text-purple-300 text-sm font-semibold">
                <Globe className="w-4 h-4" />
                Serving developers worldwide
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="bg-slate-800/50 backdrop-blur-sm py-16 border-y border-slate-700/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">What Drives Us</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Mission &amp; Vision</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Our Mission</h3>
                <p className="text-slate-300 leading-relaxed">
                  To empower developers and businesses worldwide with access to verified, production-ready applications. 
                  We provide the marketplace, tools, and trust needed to turn code into sustainable income and help 
                  businesses launch faster with quality solutions.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Our Vision</h3>
                <p className="text-slate-300 leading-relaxed">
                  To become the world's most trusted application marketplace — where every developer can monetize 
                  their skills, and every business can find the perfect solution. We're building the future where 
                  quality code is accessible, affordable, and verified.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">What We Stand For</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY TRUST US ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Why Choose VETTCODE</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Why Developers Trust Us</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Verified Code Only", desc: "Every application undergoes security audits and code quality checks. No malware, no vulnerabilities — just clean, production-ready code." },
              { icon: Clock, title: "24/7 Platform Access", desc: "Browse, purchase, and download anytime. Our platform is always available so you never miss an opportunity." },
              { icon: Download, title: "Instant Downloads", desc: "Get immediate access to source code, documentation, and assets. No waiting, no delays — start building right away." },
              { icon: Terminal, title: "Developer Support", desc: "Our support team understands code. Get technical assistance from developers who speak your language." },
              { icon: Star, title: "Real Developer Reviews", desc: "All reviews come from verified developers who've used the code. See real experiences and ratings." },
              { icon: Sparkles, title: "AI-Powered Discovery", desc: "Our AI helps you find the perfect application based on your tech stack, requirements, and preferences." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-slate-700/50 hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="bg-slate-800/50 backdrop-blur-sm py-16 border-y border-slate-700/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Get In Touch</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Contact Us</h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                Have a question, partnership inquiry, or want to sell your applications? We&apos;d love to hear from you.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="mailto:support@vettcode.com"
                className="flex flex-col items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-6 text-center transition-all group backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Email Us</p>
                  <p className="text-purple-300 font-semibold text-sm mt-1">support@vettcode.com</p>
                </div>
              </a>
              <div className="flex flex-col items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center backdrop-blur-sm">
                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Global Reach</p>
                  <p className="text-slate-400 font-medium text-sm mt-1">Serving Developers<br />Worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-10 text-white text-center shadow-2xl border border-purple-500/20">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Code2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-3">Ready to Build or Sell?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Join thousands of developers already building with VETTCODE applications.
                It&apos;s secure, instant, and trusted.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/applications"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <Package className="w-5 h-5" />
                  Browse Applications
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/become-seller"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-all backdrop-blur-sm"
                >
                  <Rocket className="w-5 h-5" />
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


