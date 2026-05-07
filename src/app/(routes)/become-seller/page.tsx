"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, ArrowRight, CheckCircle, Users, Globe, Shield, Zap, BarChart3, Package, Truck, 
  HeadphonesIcon, Star, ChevronDown, Play, DollarSign, Rocket, X, ShieldCheck, AlertTriangle, Ban, Clock
} from "lucide-react";
import Footer from "@/shared/components/Footer";

const SELLER_UI_URL = process.env.NEXT_PUBLIC_SELLER_UI_URL || "http://localhost:3003";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image: string;
  earnings: string;
}

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  stats: { value: string; label: string }[];
  testimonials: Testimonial[];
  faqs: { question: string; answer: string }[];
  demoVideoUrl: string;
  trustMessages: string[];
  warningMessages: string[];
}

const defaultContent: SiteContent = {
  heroTitle: "Sell Your Applications",
  heroSubtitle: "Join the Developer Marketplace",
  heroDescription: "Join thousands of developers worldwide. List your applications, reach more customers, and monetize your code from anywhere.",
  stats: [
    { value: "5,000+", label: "Active Developers" },
    { value: "$2M+", label: "Monthly Revenue" },
    { value: "50K+", label: "Monthly Downloads" },
    { value: "4.9/5", label: "Developer Rating" },
  ],
  testimonials: [
    { name: "Alex Chen", role: "Full-Stack Developer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", quote: "I started selling React dashboards as a side project. VettCode made it easy to reach customers and handle licensing.", earnings: "$3-5K/month" },
    { name: "Sarah Martinez", role: "Mobile App Developer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", quote: "The platform handles payments and distribution perfectly. I focus on building great apps, they handle the rest.", earnings: "$8-12K/month" },
    { name: "James Wilson", role: "API Developer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", quote: "Selling my SaaS starter kits on VettCode has been incredible. The verification system builds trust with buyers.", earnings: "$5-8K/month" },
    { name: "Priya Patel", role: "UI/UX Developer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", quote: "I sell design systems and component libraries. The instant download system works flawlessly.", earnings: "$4-7K/month" },
  ],
  faqs: [
    { question: "How much does it cost to start?", answer: "Registration is free. We charge a small commission (10-15%) only when you make a sale. No monthly fees or upfront costs." },
    { question: "How do I receive payments?", answer: "We support PayPal, Stripe, and direct bank transfers. Payments are processed within 2-3 business days after delivery confirmation." },
    { question: "What can I sell?", answer: "Web applications, mobile apps, SaaS platforms, APIs, templates, themes, plugins, libraries, and other code-based products." },
    { question: "Do I need to be a registered business?", answer: "No, individual developers can sell. Registered businesses get verified badges for increased credibility." },
    { question: "How does distribution work?", answer: "We provide instant download links, GitHub access, or email delivery. You control how your code is distributed." },
  ],
  demoVideoUrl: "",
  trustMessages: ["Secure payment processing", "Funds held until delivery confirmed", "Code verification system", "Dispute resolution support"],
  warningMessages: ["Stolen code results in immediate suspension", "Fraudulent activities lead to fund forfeiture", "Repeat violations result in permanent bans", "Illegal activities reported to authorities"],
};

const benefits = [
  { icon: Globe, title: "Global Reach", description: "Your applications visible to developers and businesses worldwide.", color: "from-purple-500 to-indigo-500" },
  { icon: Shield, title: "Secure Payments", description: "Receive payments via PayPal, Stripe, or direct bank transfer globally.", color: "from-green-500 to-emerald-500" },
  { icon: BarChart3, title: "Sales Analytics", description: "Track downloads, revenue, and customer trends with detailed insights.", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "Instant Distribution", description: "Automated delivery via download links, GitHub access, or email.", color: "from-orange-500 to-red-500" },
  { icon: HeadphonesIcon, title: "Developer Support", description: "Get help from our technical support team when you need it.", color: "from-pink-500 to-rose-500" },
  { icon: Rocket, title: "Marketing Tools", description: "Feature your apps, run promotions, and boost visibility.", color: "from-teal-500 to-green-500" },
];

const steps = [
  { step: 1, title: "Apply as Developer", description: "Fill out a short application. Takes 2 minutes.", icon: Users },
  { step: 2, title: "Code Review", description: "Our team reviews your application within 24–48 hours.", icon: ShieldCheck },
  { step: 3, title: "List Your Apps", description: "Once approved, upload your applications and set pricing.", icon: Store },
  { step: 4, title: "Start Earning", description: "Go live and start receiving orders and revenue.", icon: Truck },
];

const API_BASE = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") + "/api";

function ApplyModal({ onClose, sellerUiUrl }: { onClose: () => void; sellerUiUrl: string }) {
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '', applicationNote: '' });
  const [otp, setOtp] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.phoneNumber || !form.password) {
      setError('All fields except the business note are required.');
      return;
    }
    if (!/^\+\d{10,15}$/.test(form.phoneNumber)) {
      setError('Phone must start with + and contain 10–15 digits (e.g. +256...)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sellers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
      } else {
        setError(data.error || data.message || 'Registration failed. Try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (otp.length !== 4) { setError('Enter the 4-digit code sent to your email.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sellers/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('done');
      } else {
        setError(data.error || 'Verification failed.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Apply as Developer</h2>
                <p className="text-sm text-gray-400">Reviewed within 24–48 hours</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              <input
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
                placeholder="Phone number (e.g. +256...)"
                value={form.phoneNumber}
                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
              />
              <input
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
                placeholder="Password (min 8 chars, uppercase, number, symbol)"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <textarea
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none placeholder-gray-500"
                placeholder="Tell us about your development experience and what you plan to sell (optional)"
                rows={3}
                value={form.applicationNote}
                onChange={e => setForm(f => ({ ...f, applicationNote: e.target.value }))}
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              Submit Application
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Already applied? <a href={`${sellerUiUrl}/login`} className="text-purple-400 underline">Log in here</a>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verify your email</h2>
            <p className="text-gray-400 text-sm mb-6">We sent a 4-digit code to <span className="font-medium text-gray-300">{form.email}</span></p>
            <input
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="0000"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full mt-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              Verify Code
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
            <p className="text-gray-400 text-sm mb-4">
              Thanks <span className="font-medium text-gray-300">{form.name}</span>. Your application is under review.
              We'll notify you at <span className="font-medium text-gray-300">{form.email}</span> once it's approved — usually within 24–48 hours.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-left text-sm text-yellow-300 mb-6">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="space-y-1 list-disc list-inside text-yellow-400">
                <li>Our team reviews your application</li>
                <li>You get an email when approved</li>
                <li>Then you can log in and list your applications</li>
              </ul>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-gray-700 text-gray-200 font-semibold rounded-xl hover:bg-gray-600 transition">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BecomeSellerPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchContent();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % content.testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [content.testimonials.length]);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/site-content/become-seller");
      const data = await res.json();
      if (data.success && data.content) setContent({ ...defaultContent, ...data.content });
    } catch (e) { console.error("Failed to fetch content:", e); }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Hero Section with animated background */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px] opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full filter blur-[100px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Floating code symbols */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white rounded-full opacity-40 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Join 5,000+ developers already earning</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {content.heroTitle}
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">{content.heroSubtitle}</span>
            </h1>
            
            <p className={`text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {content.heroDescription}
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <button 
                onClick={() => setShowApplyModal(true)} 
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                <Store className="w-5 h-5" />
                Apply as Developer - Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowVideo(true)} 
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                Watch How It Works
              </button>
            </div>
            
            {/* Stats with animation */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {content.stats.map((stat, i) => (
                <div key={i} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24 text-white" viewBox="0 0 1440 96" fill="none" preserveAspectRatio="none">
            <path d="M0 96L60 85.3C120 75 240 53 360 48C480 43 600 53 720 58.7C840 64 960 64 1080 58.7C1200 53 1320 43 1380 37.3L1440 32V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Trust & Rules Section */}
      <section className="py-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg shadow-green-500/20 border border-green-500/30 hover:shadow-xl hover:border-green-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Developer Protection</h3>
              </div>
              <ul className="space-y-3">
                {content.trustMessages.map((msg, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg shadow-red-500/20 border border-red-500/30 hover:shadow-xl hover:border-red-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Platform Rules</h3>
              </div>
              <ul className="space-y-3">
                {content.warningMessages.map((msg, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Ban className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium mb-4 border border-purple-500/30">Why Choose VettCode</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Tools and support to help you monetize your code and grow your developer business</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{b.title}</h3>
                <p className="text-gray-400">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium mb-4 border border-indigo-500/30">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Selling in 4 Easy Steps</h2>
            <p className="text-gray-400">Get your developer profile up and running in minutes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                )}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all duration-300 text-center relative z-10 group-hover:-translate-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {s.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium mb-4 border border-yellow-500/30">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Hear From Our Developers</h2>
            <p className="text-gray-400">Real stories from developers monetizing their code</p>
          </div>
          
          {/* Desktop: Grid view */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {content.testimonials.map((t, i) => (
              <div key={i} className="group bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500 shadow-md" 
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=8b5cf6&color=fff`; }} 
                  />
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-gray-400 text-sm">{t.role}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span>{t.earnings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile: Carousel view */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                >
                  {content.testimonials.map((t, i) => (
                    <div key={i} className="w-full flex-shrink-0 px-2">
                      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
                        <div className="flex items-center gap-3 mb-4">
                          <img 
                            src={t.image} 
                            alt={t.name} 
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500 shadow-md" 
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=8b5cf6&color=fff`; }} 
                          />
                          <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-gray-400 text-sm">{t.role}</div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <DollarSign className="w-5 h-5" />
                            <span>{t.earnings}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {content.testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestimonial === i ? 'bg-purple-500 w-8' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>ex items-center gap-3 mb-4">
                          <img 
                            src={t.image} 
                            alt={t.name} 
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md" 
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=115061&color=fff`; }} 
                          />
                          <div>
                            <div className="font-bold text-gray-900">{t.name}</div>
                            <div className="text-gray-500 text-sm">{t.role}</div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <DollarSign className="w-5 h-5" />
                            <span>{t.earnings}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {content.testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestimonial === i ? 'bg-[#115061] w-8' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-4 border border-green-500/30">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Common Questions</h2>
              <p className="text-gray-400">Everything you need to know before getting started</p>
            </div>
            <div className="space-y-4">
              {content.faqs.map((faq, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-purple-500' : ''}`}>
                      <ChevronDown className={`w-5 h-5 transition-all duration-300 ${openFaq === i ? "rotate-180 text-white" : "text-gray-400"}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                    <div className="px-6 pb-5">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-15" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">Create your developer account today and start monetizing your code worldwide.</p>
          <button 
            onClick={() => setShowApplyModal(true)} 
            className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
          >
            <Store className="w-6 h-6" />
            Apply to Become a Developer
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            <span className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Free to apply
            </span>
            <span className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Reviewed within 48 hours
            </span>
            <span className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-400" />
              No monthly fees
            </span>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal onClose={() => setShowApplyModal(false)} sellerUiUrl={SELLER_UI_URL} />
      )}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowVideo(false)} 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
              {content.demoVideoUrl ? (
                <iframe 
                  src={content.demoVideoUrl} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                />
              ) : (
                <div className="text-center text-white p-8">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-xl font-medium">Demo video coming soon</p>
                  <p className="text-white/60 mt-2">We're working on creating helpful content for you</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Custom CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

