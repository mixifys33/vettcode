"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Smartphone, Monitor, Download, Apple, Star,
  Shield, Zap, Wifi, Bell, ShoppingBag, ArrowRight,
  CheckCircle, Play, Globe, Package, Sparkles, ChevronDown,
  FileArchive, Clock, HardDrive, RefreshCw, ExternalLink,
  Lock, Phone,
} from "lucide-react";
import type { ApkRelease } from "@/app/api/apk-releases/route";

// ─── Seller APK credentials (case-insensitive) ────────────────────────────────
const SELLER_CREDS = {
  name:    "masereka adorable kimulya",
  token:   "hacker x1234567",
  passkey: "0761819885",
};
const ADMIN_WHATSAPP = "256761819885"; // without +

// ─── Types ───────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── Static data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,         title: "Lightning Fast",     desc: "Instant load times with offline support",  color: "from-yellow-400 to-orange-500" },
  { icon: Bell,        title: "Push Notifications", desc: "Never miss a deal or order update",        color: "from-purple-400 to-pink-500"   },
  { icon: Wifi,        title: "Works Offline",      desc: "Browse products even without internet",    color: "from-blue-400 to-cyan-500"     },
  { icon: Shield,      title: "Secure & Private",   desc: "Bank-grade security for your data",        color: "from-green-400 to-emerald-500" },
  { icon: ShoppingBag, title: "One-tap Shopping",   desc: "Checkout faster than ever before",         color: "from-rose-400 to-red-500"      },
  { icon: Star,        title: "Exclusive Deals",    desc: "App-only offers and early access sales",   color: "from-amber-400 to-yellow-500"  },
];

const STEPS_IOS = [
  { step: "1", text: 'Tap the Share button (□↑) at the bottom of Safari' },
  { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
  { step: "3", text: 'Tap "Add" in the top-right corner' },
];
const STEPS_ANDROID = [
  { step: "1", text: 'Tap the three-dot menu (⋮) in Chrome' },
  { step: "2", text: 'Tap "Add to Home screen" or "Install app"' },
  { step: "3", text: 'Tap "Add" or "Install" to confirm' },
];
const STEPS_DESKTOP = [
  { step: "1", text: 'Look for the install icon (⊕) in the address bar' },
  { step: "2", text: 'Click "Install VETTCODE" in the popup' },
  { step: "3", text: 'The app opens in its own window — enjoy!' },
];

const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full opacity-20 animate-pulse pointer-events-none" style={style} />
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt]   = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled]             = useState(false);
  const [pwaInstalling, setPwaInstalling]     = useState(false);
  const [platform, setPlatform]               = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [activeTab, setActiveTab]             = useState<"pwa" | "android">("pwa");
  const [apkReleases, setApkReleases]         = useState<ApkRelease[]>([]);
  const [apkLoading, setApkLoading]           = useState(false);
  const [counts, setCounts]                   = useState({ users: 0, products: 0, rating: 0 });

  // Locked APK modal state
  const [lockedApk, setLockedApk]             = useState<ApkRelease | null>(null);
  const [unlockName, setUnlockName]           = useState("");
  const [unlockToken, setUnlockToken]         = useState("");
  const [unlockKey, setUnlockKey]             = useState("");
  const [unlockError, setUnlockError]         = useState("");
  const UNLOCK_STORAGE_KEY = "seller_apk_unlocked";

  const isAlreadyUnlocked = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(UNLOCK_STORAGE_KEY) === "true";
  };

  const handleLockedDownload = (apk: ApkRelease) => {
    if (isAlreadyUnlocked()) {
      window.open(apk.downloadUrl, "_blank");
      return;
    }
    setLockedApk(apk);
    setUnlockName(""); setUnlockToken(""); setUnlockKey(""); setUnlockError("");
  };

  const handleUnlockSubmit = () => {
    const n = unlockName.trim().toLowerCase();
    const t = unlockToken.trim().toLowerCase();
    const k = unlockKey.trim().toLowerCase();
    if (n === SELLER_CREDS.name && t === SELLER_CREDS.token && k === SELLER_CREDS.passkey) {
      localStorage.setItem(UNLOCK_STORAGE_KEY, "true");
      window.open(lockedApk!.downloadUrl, "_blank");
      setLockedApk(null);
    } else {
      setUnlockError("Incorrect credentials. Please check and try again, or contact admin.");
    }
  };

  // Refs for scroll targets
  const tabSectionRef = useRef<HTMLElement>(null);

  // ── Hero button: switch to Android tab + scroll to APK downloads ──────────
  const handleHeroButton = () => {
    setActiveTab("android");
    setTimeout(() => {
      tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ── Scroll to tabs (used by PWA fallback) ─────────────────────────────────
  const scrollToTabs = () => {
    tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Fetch APK releases ─────────────────────────────────────────────────────
  const fetchApks = async () => {
    setApkLoading(true);
    try {
      const res  = await fetch("/api/apk-releases");
      const data = await res.json();
      setApkReleases(data.releases ?? []);
    } catch { setApkReleases([]); }
    finally   { setApkLoading(false); }
  };
  useEffect(() => { fetchApks(); }, []);

  // ── Detect platform ────────────────────────────────────────────────────────
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua))  setPlatform("ios");
    else if (/android/.test(ua))       setPlatform("android");
    else                               setPlatform("desktop");
  }, []);

  // ── Capture beforeinstallprompt — DO NOT auto-trigger, let user click ──────
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstalled(true); setDeferredPrompt(null); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Animated counter ───────────────────────────────────────────────────────
  useEffect(() => {
    const targets = { users: 50000, products: 120000, rating: 49 };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / 60, 3);
      setCounts({
        users:    Math.round(targets.users    * ease),
        products: Math.round(targets.products * ease),
        rating:   Math.round(targets.rating   * ease),
      });
      if (step >= 60) clearInterval(timer);
    }, 2000 / 60);
    return () => clearInterval(timer);
  }, []);

  // ── PWA install — triggers browser prompt or shows animated guide ──────────
  const handlePwaInstall = async () => {
    if (installed) return;
    if (deferredPrompt) {
      // Browser supports one-click install — trigger it directly
      setPwaInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setInstalled(true);
        } else {
          // User dismissed — reset so they can try again
          setPwaInstalling(false);
        }
        setDeferredPrompt(null);
      } catch {
        setPwaInstalling(false);
      } finally {
        setPwaInstalling(false);
      }
    } else {
      // No prompt — open browser's native add-to-homescreen via URL trick on Android
      // On desktop/iOS just scroll to the manual steps
      if (platform === "android") {
        // Chrome on Android: navigate to the page which re-triggers the prompt check
        window.location.href = window.location.href;
      }
      setActiveTab("pwa");
      setTimeout(() => {
        tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const particles = Array.from({ length: 12 }, (_, i) => ({
    width:  `${20 + (i * 17) % 40}px`,
    height: `${20 + (i * 17) % 40}px`,
    top:    `${(i * 31) % 90}%`,
    left:   `${(i * 23) % 90}%`,
    background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#ec4899" : "#f59e0b",
    animationDelay:    `${i * 0.3}s`,
    animationDuration: `${2 + (i % 3)}s`,
  }));

  return (
    <div className="min-h-screen bg-[#f1f1f1] overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20 animate-[spin_20s_linear_infinite]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-20 animate-[spin_25s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600 rounded-full opacity-10 animate-pulse" />
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium animate-bounce">
            <Sparkles size={16} className="text-yellow-400" />
            Now available as an app
          </div>

          {/* App icon */}
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-[bounce_3s_ease-in-out_infinite]">
              <ShoppingBag size={56} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle size={18} className="text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                VETTCODE
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
              Install the app for a faster, richer shopping experience — right on your device.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-2">
            {[
              { value: `${(counts.users    / 1000).toFixed(0)}K+`, label: "Happy Shoppers" },
              { value: `${(counts.products / 1000).toFixed(0)}K+`, label: "Products"       },
              { value: `${(counts.rating   / 10  ).toFixed(1)}★`,  label: "App Rating"     },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-yellow-400">{value}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Hero CTA — scrolls to tab section ── */}
          {installed ? (
            <div className="flex items-center gap-3 bg-green-500/20 border border-green-400/40 rounded-2xl px-8 py-4 text-green-300 text-lg font-semibold">
              <CheckCircle size={24} />
              vettcode  is installed!
            </div>
          ) : (
            <button
              onClick={handleHeroButton}
              className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Download size={22} />
                Install vettcode 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </button>
          )}

          <ChevronDown size={28} className="text-white/40 animate-bounce mt-4" />
        </div>
      </section>

      {/* ── TAB SWITCHER — this is the scroll target ── */}
      <section ref={tabSectionRef} className="max-w-4xl mx-auto px-4 py-12 scroll-mt-4">
        <div className="flex bg-white rounded-2xl shadow-md p-1.5 gap-1">
          {[
            { key: "pwa",     icon: Globe,      label: "Install as App (PWA)" },
            { key: "android", icon: Smartphone, label: "Android APK"          },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "pwa" | "android")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── PWA PANEL ── */}
      {activeTab === "pwa" && (
        <section className="max-w-4xl mx-auto px-4 pb-12 space-y-8">

          {/* ── DEDICATED PWA INSTALL BUTTON ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-xl shadow-indigo-300/40">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Globe size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Install PWA Version</h3>
              <p className="text-white/80 text-sm mb-6 max-w-sm mx-auto">
                Add VETTCODE directly to your home screen or desktop — works like a native app, no app store needed.
              </p>

              {installed ? (
                <div className="inline-flex items-center gap-2 bg-green-400/20 border border-green-300/40 rounded-xl px-6 py-3 text-green-200 font-bold">
                  <CheckCircle size={20} />
                  Already installed on your device!
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePwaInstall}
                    disabled={pwaInstalling}
                    className="group inline-flex items-center gap-3 bg-white text-indigo-700 font-black text-base px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-70"
                  >
                    {pwaInstalling ? (
                      <span className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" />
                    ) : (
                      <Download size={20} />
                    )}
                    {pwaInstalling ? "Creating shortcut…" : deferredPrompt ? "Install PWA Version" : "Add to Home Screen"}
                    {!pwaInstalling && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>

                  {/* Dynamic hint based on platform & prompt availability */}
                  <div className="mt-5 bg-white/10 rounded-xl px-5 py-3 text-sm text-white/80 max-w-sm mx-auto">
                    {deferredPrompt ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Your browser is ready — click the button above to install instantly
                      </span>
                    ) : platform === "ios" ? (
                      <span>📱 On Safari: tap <strong>Share (□↑)</strong> → <strong>Add to Home Screen</strong></span>
                    ) : platform === "android" ? (
                      <span>📱 On Chrome: tap <strong>menu (⋮)</strong> → <strong>Add to Home screen</strong></span>
                    ) : (
                      <span>🖥️ On Chrome/Edge: click the <strong>install icon (⊕)</strong> in the address bar</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Platform step cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Apple,      title: "iPhone / iPad", subtitle: "iOS Safari",    gradient: "from-gray-800 to-gray-900",    steps: STEPS_IOS,     active: platform === "ios"     },
              { icon: Smartphone, title: "Android",       subtitle: "Chrome Browser",gradient: "from-green-600 to-emerald-700",steps: STEPS_ANDROID, active: platform === "android" },
              { icon: Monitor,    title: "Desktop",       subtitle: "Chrome / Edge", gradient: "from-indigo-600 to-purple-700",steps: STEPS_DESKTOP, active: platform === "desktop" },
            ].map(({ icon: Icon, title, subtitle, gradient, steps, active }) => (
              <div
                key={title}
                className={`relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  active ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                }`}
              >
                {active && (
                  <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    Your device
                  </div>
                )}
                <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-3`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{title}</div>
                    <div className="text-white/70 text-sm">{subtitle}</div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {steps.map(({ step, text }) => (
                    <div key={step} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {step}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {installed && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <CheckCircle size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2">Successfully Installed!</h3>
              <p className="text-white/90">VETTCODE is now on your device. Enjoy the full app experience!</p>
            </div>
          )}
        </section>
      )}

      {/* ── ANDROID APK PANEL ── */}
      {activeTab === "android" && (
        <section className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Android APK</h2>
                <p className="text-gray-500">Direct install for Android devices</p>
              </div>
            </div>

            <div className="space-y-3">
              {apkLoading ? (
                <div className="flex items-center justify-center gap-3 py-10 text-gray-400">
                  <RefreshCw size={20} className="animate-spin" />
                  <span className="text-sm">Loading releases…</span>
                </div>
              ) : apkReleases.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Package size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No APK releases yet</p>
                  <p className="text-gray-400 text-xs max-w-xs">
                    Add entries to <code className="bg-gray-100 px-1 rounded">public/apk-releases.json</code> and they'll appear here.
                  </p>
                </div>
              ) : (
                apkReleases.map((apk) => (
                  apk.available && apk.downloadUrl ? (
                    <a
                      key={apk.fileName}
                      href={apk.locked ? undefined : apk.downloadUrl}
                      target={apk.locked ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      onClick={apk.locked ? (e) => { e.preventDefault(); handleLockedDownload(apk); } : undefined}
                      className="group flex items-center justify-between p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shrink-0">
                          {apk.locked ? <Lock size={20} className="text-white" /> : <FileArchive size={20} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{apk.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <HardDrive size={11} /> {apk.size}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={11} />
                              {new Date(apk.uploadedAt).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {apk.locked && (
                              <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
                                <Lock size={10} /> Requires access key
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-500 group-hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-3">
                        {apk.locked ? <Lock size={13} /> : <ExternalLink size={13} />}
                        {apk.locked ? "Get Access" : "Download"}
                      </div>
                    </a>
                  ) : (
                    <div
                      key={apk.fileName}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gray-300 flex items-center justify-center shrink-0">
                          <FileArchive size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-600 truncate">{apk.name}</p>
                          {apk.note && <p className="text-xs text-gray-400 truncate">{apk.note}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg shrink-0 ml-3">
                        Coming Soon
                      </span>
                    </div>
                  )
                ))
              )}

              {!apkLoading && (
                <button
                  onClick={fetchApks}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto pt-1"
                >
                  <RefreshCw size={12} />
                  Refresh releases
                </button>
              )}
            </div>

            {/* How to install APK */}
            <div className="mt-8">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Play size={18} className="text-indigo-600" />
                How to install an APK
              </h3>
              <div className="space-y-3">
                {[
                  "Download the APK file to your Android device",
                  'Go to Settings → Security → Enable "Unknown Sources" or "Install unknown apps"',
                  "Open the downloaded APK file from your Downloads folder",
                  'Tap "Install" and wait for the installation to complete',
                  "Open vettcode  from your app drawer and enjoy!",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES GRID ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Why install the app?</h2>
        <p className="text-center text-gray-500 mb-10">Everything you love about vettcode uganda, supercharged.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-10 text-white text-center shadow-2xl">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative z-10">
            <ShoppingBag size={48} className="mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-black mb-3">Start shopping smarter</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Install VETTCODE today and get access to exclusive app-only deals, faster checkout, and real-time order tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handlePwaInstall}
                disabled={pwaInstalling || installed}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-60"
              >
                {installed ? <CheckCircle size={20} /> : <Download size={20} />}
                {installed ? "Installed!" : pwaInstalling ? "Installing…" : "Install PWA Version"}
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                <ShoppingBag size={20} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seller APK Access Modal ── */}
      {lockedApk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            {/* Header */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mx-auto mb-4">
              <Lock size={28} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 text-center mb-1">Seller App Access Required</h2>
            <p className="text-gray-500 text-sm text-center mb-5">
              This APK is for authorised sellers only. Enter your credentials below to download.
            </p>

            {/* Fields */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={unlockName}
                onChange={e => { setUnlockName(e.target.value); setUnlockError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]"
              />
              <input
                type="text"
                placeholder="Access Token"
                value={unlockToken}
                onChange={e => { setUnlockToken(e.target.value); setUnlockError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]"
              />
              <input
                type="text"
                placeholder="Pass Key"
                value={unlockKey}
                onChange={e => { setUnlockKey(e.target.value); setUnlockError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]"
              />
            </div>

            {/* Error */}
            {unlockError && (
              <p className="text-red-500 text-xs text-center mb-3">{unlockError}</p>
            )}

            {/* Contact admin */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Don&apos;t have credentials? Contact admin:</p>
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}?text=Hi%2C%20I%20need%20seller%20APK%20access%20credentials`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-bold text-sm hover:text-green-700 transition"
              >
                <Phone size={14} />
                +256 761 819 885 — Call or WhatsApp
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUnlockSubmit}
                className="w-full py-3 bg-[#115061] text-white rounded-xl font-bold text-sm hover:bg-[#0d3f4d] transition"
              >
                Verify &amp; Download
              </button>
              <button
                onClick={() => setLockedApk(null)}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
