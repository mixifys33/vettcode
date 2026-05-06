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
  heroTitle: "Start Selling Online",
  heroSubtitle: "Grow Your Business",
  heroDescription: "Join thousands of sellers across Worldwide. List your products, reach more customers, and manage your business from anywhere.",
  stats: [
    { value: "15,000+", label: "Active Sellers" },
    { value: "UGX 2B+", label: "Monthly Sales" },
    { value: "500K+", label: "Monthly Customers" },
    { value: "4.7/5", label: "Seller Rating" },
  ],
  testimonials: [
    { name: "Amina Nakato", role: "Clothing & Fashion", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face", quote: "I started selling kitenge dresses from home. The platform is easy to use and customers find my products easily.", earnings: "UGX 2-4M/month" },
    { name: "David Ochieng", role: "Electronics & Phones", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face", quote: "Managing inventory and orders is straightforward. The analytics help me know what products to stock.", earnings: "UGX 5-8M/month" },
    { name: "Fatuma Auma", role: "Beauty & Cosmetics", image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=face", quote: "I sell natural hair products. The mobile money integration makes receiving payments very convenient.", earnings: "UGX 1.5-3M/month" },
    { name: "Joseph Mukasa", role: "Home & Kitchen", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", quote: "Started with kitchen utensils, now I sell various home items. Good support when I have questions.", earnings: "UGX 3-5M/month" },
  ],
  faqs: [
    { question: "How much does it cost to start?", answer: "Registration is free. We charge a small commission (8-12%) only when you make a sale. No monthly fees." },
    { question: "How do I receive payments?", answer: "We support Mobile Money (MTN, Airtel), bank transfers, and other local payment methods. Payments processed within 2-3 business days." },
    { question: "What products can I sell?", answer: "Most legal products including fashion, electronics, beauty, food items, handmade goods, and more." },
    { question: "Do I need a business registration?", answer: "No, individuals can sell. Registered businesses get verified badges for increased trust." },
    { question: "How does shipping work?", answer: "Handle delivery yourself or use our partner delivery services. We provide tracking for all orders." },
  ],
  demoVideoUrl: "",
  trustMessages: ["Secure payment processing", "Funds held until delivery confirmed", "Seller verification system", "Dispute resolution support"],
  warningMessages: ["Counterfeit products result in suspension", "Fraudulent activities lead to fund forfeiture", "Repeat violations result in permanent bans", "Illegal activities reported to authorities"],
};

const benefits = [
  { icon: Globe, title: "Reach More Customers", description: "Your products visible to thousands of buyers across Worldwide.", color: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "Secure Payments", description: "Receive payments via Mobile Money, bank transfer, or other local methods.", color: "from-green-500 to-emerald-500" },
  { icon: BarChart3, title: "Sales Analytics", description: "Track your sales and customer trends to make better decisions.", color: "from-purple-500 to-pink-500" },
  { icon: Zap, title: "Easy Setup", description: "Create your shop and list products in minutes. No technical skills needed.", color: "from-orange-500 to-red-500" },
  { icon: HeadphonesIcon, title: "Seller Support", description: "Get help when you need it from our support team.", color: "from-indigo-500 to-purple-500" },
  { icon: Rocket, title: "Marketing Tools", description: "Run promotions and participate in sales events.", color: "from-teal-500 to-green-500" },
];

const steps = [
  { step: 1, title: "Apply to Sell", description: "Fill out a short application. Takes 2 minutes.", icon: Users },
  { step: 2, title: "Get Reviewed", description: "Our team reviews your application within 24–48 hours.", icon: ShieldCheck },
  { step: 3, title: "Set Up Shop", description: "Once approved, add your shop details and products.", icon: Store },
  { step: 4, title: "Start Selling", description: "Go live and start receiving orders.", icon: Truck },
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#115061] to-[#1a7a8a] flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Apply to Sell</h2>
                <p className="text-sm text-gray-500">Reviewed within 24–48 hours</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30"
                placeholder="Phone number (e.g. +256...)"
                value={form.phoneNumber}
                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
              />
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30"
                placeholder="Password (min 8 chars, uppercase, number, symbol)"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30 resize-none"
                placeholder="Tell us about your business — what you sell, where you're based (optional)"
                rows={3}
                value={form.applicationNote}
                onChange={e => setForm(f => ({ ...f, applicationNote: e.target.value }))}
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-5 py-3 bg-gradient-to-r from-[#115061] to-[#1a7a8a] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              Submit Application
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Already applied? <a href={`${sellerUiUrl}/login`} className="text-[#115061] underline">Log in here</a>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#115061]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-500 text-sm mb-6">We sent a 4-digit code to <span className="font-medium text-gray-700">{form.email}</span></p>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#115061]/30"
              placeholder="0000"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full mt-5 py-3 bg-gradient-to-r from-[#115061] to-[#1a7a8a] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              Verify Code
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Thanks <span className="font-medium text-gray-700">{form.name}</span>. Your application is under review.
              We'll notify you at <span className="font-medium text-gray-700">{form.email}</span> once it's approved — usually within 24–48 hours.
            </p>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-left text-sm text-yellow-800 mb-6">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="space-y-1 list-disc list-inside text-yellow-700">
                <li>Our team reviews your application</li>
                <li>You get an email when approved</li>
                <li>Then you can log in and set up your shop</li>
              </ul>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with animated background */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-[#0a2e38] via-[#115061] to-[#0d3f4d] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full filter blur-[100px] opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-400 rounded-full filter blur-[100px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Floating shapes */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-teal-400 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white rounded-full opacity-40 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Join 15,000+ sellers already growing</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {content.heroTitle}
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">{content.heroSubtitle}</span>
            </h1>
            
            <p className={`text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {content.heroDescription}
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <button 
                onClick={() => setShowApplyModal(true)} 
                className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                <Store className="w-5 h-5" />
                Apply to Sell - Free
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
      <section className="py-12 bg-gradient-to-r from-green-50 via-white to-red-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-100/50 border border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Seller Protection</h3>
              </div>
              <ul className="space-y-3">
                {content.trustMessages.map((msg, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-red-100/50 border border-red-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Platform Rules</h3>
              </div>
              <ul className="space-y-3">
                {content.warningMessages.map((msg, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <Ban className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Tools and support to help you run and grow your business</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Selling in 4 Easy Steps</h2>
            <p className="text-gray-600">Get your shop up and running in minutes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#115061] to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center relative z-10 group-hover:-translate-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#115061] to-[#1a7a8a] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {s.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#115061]/10 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-7 h-7 text-[#115061]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hear From Our Sellers</h2>
            <p className="text-gray-600">Real stories from sellers growing their businesses</p>
          </div>
          
          {/* Desktop: Grid view */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {content.testimonials.map((t, i) => (
              <div key={i} className="group bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mb-4">
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
                      <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.quote}"</p>
                        <div className="flex items-center gap-3 mb-4">
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Common Questions</h2>
              <p className="text-gray-600">Everything you need to know before getting started</p>
            </div>
            <div className="space-y-4">
              {content.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-[#115061]' : ''}`}>
                      <ChevronDown className={`w-5 h-5 transition-all duration-300 ${openFaq === i ? "rotate-180 text-white" : "text-gray-500"}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a2e38] via-[#115061] to-[#0d3f4d] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-400 rounded-full filter blur-[100px] opacity-15" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400 rounded-full filter blur-[100px] opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">Create your seller account today and start reaching customers across Worldwide.</p>
          <button 
            onClick={() => setShowApplyModal(true)} 
            className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
          >
            <Store className="w-6 h-6" />
            Apply to Become a Seller
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

