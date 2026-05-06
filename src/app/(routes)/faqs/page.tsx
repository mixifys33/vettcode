"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Search, MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

// Set page metadata via useEffect for client component
const PAGE_TITLE = "FAQs - Frequently Asked Questions | VETTCODE";
const PAGE_DESCRIPTION = "Find answers to common questions about VETTCODE - the trusted marketplace for verified applications. Learn about orders, payments, delivery, support, and more.";

// FAQ Categories with questions
const faqCategories = [
  {
    id: "general",
    title: "General Questions",
    icon: "❓",
    faqs: [
      {
        question: "What is VETTCODE?",
        answer: "VETTCODE is Worldwide's leading online marketplace connecting buyers with trusted sellers across the country. We offer a wide range of products from electronics to fashion, home goods, and more, all delivered right to your doorstep."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button in the top right corner, fill in your details (name, email, phone number), and verify your email. You can also sign up using your Google account for faster registration."
      },
      {
        question: "Is VETTCODE available throughout Worldwide?",
        answer: "Yes! We deliver to all major cities and towns across Worldwide including Global, Entebbe, Jinja, Mbarara, Gulu, and many more locations. Check our delivery zones during checkout."
      },
      {
        question: "Do I need an account to shop?",
        answer: "While you can browse products without an account, you'll need to create one to place orders, track deliveries, save items to your wishlist, and access exclusive deals."
      }
    ]
  },
  {
    id: "orders",
    title: "Orders & Payments",
    icon: "🛒",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Mobile Money (MTN MoMo, Airtel Money), bank transfers, and cash on delivery for eligible orders. All online payments are processed securely through our trusted payment partners."
      },
      {
        question: "How do I track my order?",
        answer: "Once your order is confirmed, you'll receive a tracking number via SMS and email. You can also track your order in real-time by visiting the 'My Orders' section in your account dashboard."
      },
      {
        question: "Can I cancel or modify my order?",
        answer: "Yes, you can cancel or modify your order within 2 hours of placing it, as long as it hasn't been shipped yet. Go to 'My Orders', select the order, and click 'Cancel' or 'Modify'. After shipping, cancellations are not possible."
      },
      {
        question: "What if I receive a damaged or wrong item?",
        answer: "We're sorry if that happens! Contact our support team within 48 hours of delivery with photos of the item. We'll arrange a free return and either send a replacement or issue a full refund."
      },
      {
        question: "How long does delivery take?",
        answer: "Delivery times vary by location: Global (1-2 days), other major cities (2-4 days), and remote areas (4-7 days). Express delivery options are available for faster shipping."
      }
    ]
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: "🚚",
    faqs: [
      {
        question: "How much does shipping cost?",
        answer: "Shipping costs depend on your location and order size. Standard delivery within Global starts at UGX 5,000. Orders above UGX 100,000 qualify for free shipping. You'll see the exact cost at checkout."
      },
      {
        question: "Can I choose a specific delivery time?",
        answer: "Yes! During checkout, you can select your preferred delivery time slot. We offer morning (8AM-12PM), afternoon (12PM-4PM), and evening (4PM-8PM) delivery windows."
      },
      {
        question: "What is a pickup station?",
        answer: "Pickup stations are convenient locations where you can collect your order instead of home delivery. This option is faster and often cheaper. Select 'Pickup Station' during checkout to see available locations near you."
      },
      {
        question: "Do you deliver on weekends?",
        answer: "Yes, we deliver Monday through Saturday. Sunday deliveries are available in select areas for an additional fee. Check availability during checkout."
      }
    ]
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: "↩️",
    faqs: [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for most items. Products must be unused, in original packaging, with all tags attached. Electronics and perishables have specific return conditions - check the product page for details."
      },
      {
        question: "How do I return an item?",
        answer: "Go to 'My Orders', select the item you want to return, click 'Request Return', and choose a reason. Our team will review your request within 24 hours and arrange a free pickup if approved."
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 3-5 business days after we receive and inspect the returned item. The money will be credited to your original payment method (Mobile Money, bank account, or VETTCODE wallet)."
      },
      {
        question: "Can I exchange an item instead of returning it?",
        answer: "Yes! If you want a different size, color, or model, select 'Exchange' instead of 'Return' when submitting your request. We'll ship the replacement item once we receive the original."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Security",
    icon: "🔐",
    faqs: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
      },
      {
        question: "Is my personal information safe?",
        answer: "Absolutely. We use industry-standard encryption (TLS/HTTPS) to protect your data. We never store your payment card details, and we never share your personal information with third parties without your consent. Read our Privacy Policy for more details."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to 'Profile Settings' > 'Account' > 'Delete Account'. Please note that deleting your account is permanent and will remove all your order history, saved addresses, and wishlist items."
      },
      {
        question: "Can I have multiple delivery addresses?",
        answer: "Yes! You can save multiple addresses in your account. During checkout, simply select which address you want to use for that particular order."
      }
    ]
  },
  {
    id: "sellers",
    title: "For Sellers",
    icon: "🏪",
    faqs: [
      {
        question: "How do I become a seller on VETTCODE?",
        answer: "Visit our 'Become a Seller' page, fill out the registration form with your business details, and submit required documents (business license, ID, tax info). Our team will review your application within 2-3 business days."
      },
      {
        question: "What fees do sellers pay?",
        answer: "We charge a commission of 8-12% per sale (depending on product category). There are no monthly fees or listing fees. You only pay when you make a sale."
      },
      {
        question: "How do sellers receive payments?",
        answer: "Payments are transferred to your registered Mobile Money account or bank account within 2-3 business days after the order is delivered and confirmed by the buyer."
      },
      {
        question: "Can I manage my shop from my phone?",
        answer: "Yes! Download our Seller App (available for Android and iOS) to manage products, view orders, respond to customer messages, and track your sales on the go."
      }
    ]
  }
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Set document title and meta description
  useEffect(() => {
    document.title = PAGE_TITLE;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", PAGE_DESCRIPTION);
    }
  }, []);

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const displayCategories = searchQuery ? filteredCategories : faqCategories;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0a1628] via-[#112240] to-[#1a3a5c] text-white py-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 rounded-full px-5 py-2 mb-6 animate-fade-in">
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold tracking-wide uppercase">
              Help Center
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 animate-slide-up">
            Frequently Asked Questions
          </h1>
          
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
            Find answers to common questions about shopping, orders, delivery, and more
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto animate-slide-up delay-200">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="lg:flex lg:gap-8">
          {/* Category Sidebar */}
          <aside className="lg:w-64 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
                Categories
              </p>
              {faqCategories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  {...(activeCategory === category.id
                    ? {
                        className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                      }
                    : {
                        className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 shadow-sm hover:shadow-md hover:scale-102"
                      }
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-semibold text-sm">{category.title}</span>
                  <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${activeCategory === category.id ? 'rotate-180' : ''}`} />
                </button>
              ))}
            </div>
          </aside>

          {/* FAQ Content */}
          <div className="flex-1">
            {searchQuery && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl animate-fade-in">
                <p className="text-sm text-blue-800">
                  Found <strong>{displayCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)}</strong> result(s) for &quot;<strong>{searchQuery}</strong>&quot;
                </p>
              </div>
            )}

            {displayCategories.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">Try different keywords or browse categories</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {displayCategories
                  .filter(cat => searchQuery || cat.id === activeCategory)
                  .map((category, catIndex) => (
                    <div key={category.id} className="animate-fade-in" style={{ animationDelay: `${catIndex * 100}ms` }}>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-3xl">{category.icon}</span>
                        <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      </div>

                      <div className="space-y-3">
                        {category.faqs.map((faq, faqIndex) => {
                          const faqId = `${category.id}-${faqIndex}`;
                          const isOpen = openFaq === faqId;

                          return (
                            <div
                              key={faqId}
                              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 animate-slide-up"
                              style={{ animationDelay: `${faqIndex * 50}ms` }}
                            >
                              <button
                                onClick={() => setOpenFaq(isOpen ? null : faqId)}
                                className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-gray-50 transition-colors group"
                              >
                                <span className="font-semibold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
                                  {faq.question}
                                </span>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    isOpen ? 'bg-blue-600 rotate-180' : 'bg-gray-100 group-hover:bg-blue-100'
                                  }`}
                                >
                                  <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                                </div>
                              </button>

                              <div
                                className={`transition-all duration-500 ease-in-out ${
                                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="px-6 pb-5 pt-2">
                                  <div className="pl-4 border-l-4 border-blue-500">
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Still have questions?</h2>
              <p className="text-blue-100 text-lg">Our support team is here to help you 24/7</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a
                href="mailto:support@VETTCODE.com"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Email Us</h3>
                <p className="text-blue-100 text-sm">support@VETTCODE.com</p>
              </a>

              <a
                href="tel:+256700000000"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Call Us</h3>
                <p className="text-blue-100 text-sm">+256 700 000 000</p>
              </a>

              <Link
                href="/inbox"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Live Chat</h3>
                <p className="text-blue-100 text-sm">Chat with our team</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6 justify-center text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
            ← Back to Home
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors font-medium">
            Privacy Policy
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors font-medium">
            About Us
          </Link>
          <Link href="/become-seller" className="hover:text-blue-600 transition-colors font-medium">
            Become a Seller
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </main>
  );
}


