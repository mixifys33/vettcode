"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram, 
  Youtube, Linkedin, Send, Heart, Shield, Truck, CreditCard,
  Clock, ChevronRight, ExternalLink, Loader2
} from "lucide-react";

interface FooterContent {
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  quickLinks: { label: string; href: string }[];
  customerService: { label: string; href: string }[];
  sellerLinks: { label: string; href: string }[];
  paymentMethods: string[];
  copyrightText: string;
  trustBadges: { icon: string; title: string; description: string }[];
}

const defaultContent: FooterContent = {
  companyName: "VETTCODE",
  tagline: "Verified Codebases for Founders",
  description: "The trusted marketplace for production-ready, verified applications. Built by developers, trusted by founders. Launch faster with secure, reliable codebases.",
  email: "hello@vettcode.com",
  phone: "+256 761 818 885",
  address: "Global, Worldwide",
  socialLinks: {
    facebook: "https://facebook.com/vettcode",
    twitter: "https://twitter.com/vettcode",
    instagram: "https://instagram.com/vettcode",
    youtube: "https://youtube.com/vettcode",
    linkedin: "https://linkedin.com/company/vettcode",
  },
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "Browse Applications", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Pricing", href: "/pricing" },
    { label: "Documentation", href: "/docs" },
  ],
  customerService: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Support", href: "/support" },
    { label: "License Info", href: "/licenses" },
    { label: "My Purchases", href: "/orders" },
  ],
  sellerLinks: [
    { label: "List Your App", href: "/become-seller" },
    { label: "Developer Dashboard", href: "/seller-dashboard" },
    { label: "Submission Guidelines", href: "/seller-guidelines" },
    { label: "Success Stories", href: "/success-stories" },
  ],
  paymentMethods: ["Visa", "Mastercard", "PayPal", "Stripe", "Crypto"],
  copyrightText: "© 2025 VETTCODE. All rights reserved.",
  trustBadges: [
    { icon: "shield", title: "Verified Quality", description: "100% vetted code" },
    { icon: "truck", title: "Instant Access", description: "Download immediately" },
    { icon: "clock", title: "24/7 Support", description: "Always here to help" },
    { icon: "creditCard", title: "Secure Payments", description: "Enterprise-grade security" },
  ],
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  truck: Truck,
  clock: Clock,
  creditCard: CreditCard,
};

export default function Footer() {
  const [content, setContent] = useState<FooterContent>(defaultContent);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    try {
      const res = await fetch("/api/site-content/footer");
      const data = await res.json();
      if (data.success && data.content) {
        setContent({ ...defaultContent, ...data.content });
      }
    } catch {
      // Use default content on error
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEmail("");
      alert("Thank you for subscribing!");
    } catch (error) {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.trustBadges.map((badge, index) => {
              const Icon = iconMap[badge.icon] || Shield;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{badge.title}</p>
                    <p className="text-xs text-gray-400">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black">
                <span className="text-white">VETT</span>
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">CODE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed max-w-sm">
              {content.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
                <Mail className="w-4 h-4" />
                {content.email}
              </a>
              <a href={`tel:${content.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
                <Phone className="w-4 h-4" />
                {content.phone}
              </a>
              <p className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                {content.address}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {Object.entries(content.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-blue-500/20 hover:border hover:border-purple-500/30 rounded-lg transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {content.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition group">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {content.customerService.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition group">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Sellers</h3>
            <ul className="space-y-2">
              {content.sellerLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("http") ? (
                    <a 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition group"
                    >
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition group">
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Subscribe to Our Newsletter</h3>
              <p className="text-gray-400 text-sm">Get the latest deals and updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              {content.copyrightText}
            </p>

            {/* Legal Links */}
            <div className="flex items-center justify-center gap-4">
              <a href="/privacy" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-700 text-xs">·</span>
              <a href="/about" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                About Us
              </a>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-gray-500 text-xs">We Accept:</span>
              {content.paymentMethods.map((method, index) => (
                <span key={index} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Made with Love */}
      <div className="bg-gray-950 py-3">
        <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1">
          Built with <Heart className="w-3 h-3 text-purple-500 fill-purple-500" /> by developers, for founders
        </p>
      </div>
    </footer>
  );
}

