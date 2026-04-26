import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | EshopUG",
  description:
    "EshopUG Privacy Policy — learn how we collect, use, and protect your personal information on Uganda's #1 online marketplace.",
  alternates: { canonical: "https://eshopug.vercel.app/privacy" },
};

const LAST_UPDATED = "April 26, 2026";
const CONTACT_EMAIL = "support@eshopug.com";
const APP_NAME = "EshopUG";
const COMPANY = "EshopUG (AD Technologies Uganda)";
const WEBSITE = "https://eshopug.vercel.app";

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mb-10 scroll-mt-24">
    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
      {title}
    </h2>
    <div className="space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
      {children}
    </div>
  </section>
);

// ── Table of contents entry ──────────────────────────────────────────────────
const TocItem = ({ href, label }: { href: string; label: string }) => (
  <li>
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors"
    >
      {label}
    </a>
  </li>
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#112240] to-[#1a3a5c] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-5">
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">
              Legal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 lg:flex lg:gap-10">
        {/* Sticky Table of Contents */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Contents
            </p>
            <ol className="space-y-2 list-decimal list-inside">
              <TocItem href="#overview" label="Overview" />
              <TocItem href="#information-we-collect" label="Information We Collect" />
              <TocItem href="#how-we-use" label="How We Use Your Data" />
              <TocItem href="#sharing" label="Sharing Your Information" />
              <TocItem href="#permissions" label="App Permissions" />
              <TocItem href="#cookies" label="Cookies & Tracking" />
              <TocItem href="#data-retention" label="Data Retention" />
              <TocItem href="#security" label="Data Security" />
              <TocItem href="#your-rights" label="Your Rights" />
              <TocItem href="#children" label="Children's Privacy" />
              <TocItem href="#third-party" label="Third-Party Services" />
              <TocItem href="#international" label="International Transfers" />
              <TocItem href="#changes" label="Policy Changes" />
              <TocItem href="#contact" label="Contact Us" />
            </ol>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          {/* Intro banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-blue-800">
            <strong>Your privacy matters to us.</strong> This policy explains what personal
            information {APP_NAME} collects, why we collect it, and how we protect it. By
            using our platform you agree to the practices described here.
          </div>

          {/* 1 */}
          <Section id="overview" title="1. Overview">
            <p>
              {COMPANY} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the {APP_NAME} online
              marketplace available at{" "}
              <a href={WEBSITE} className="text-blue-600 underline">
                {WEBSITE}
              </a>{" "}
              and via our mobile application. We are committed to protecting your personal
              information and your right to privacy.
            </p>
            <p>
              This Privacy Policy applies to all information collected through our website,
              mobile application, and any related services, sales, marketing, or events
              (collectively the &quot;Services&quot;).
            </p>
          </Section>

          {/* 2 */}
          <Section id="information-we-collect" title="2. Information We Collect">
            <p className="font-semibold text-gray-900">
              Information you provide directly:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Full name, email address, and password when you register</li>
              <li>Phone number and physical address for delivery purposes</li>
              <li>Date of birth and gender (optional, for personalisation)</li>
              <li>Profile picture / avatar image</li>
              <li>Payment information (processed securely — we do not store card numbers)</li>
              <li>Messages sent through our in-app chat or customer support</li>
              <li>Product reviews, ratings, and feedback</li>
              <li>Seller business details (for seller accounts)</li>
            </ul>

            <p className="font-semibold text-gray-900 mt-4">
              Information collected automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Device type, operating system, and browser information</li>
              <li>IP address and approximate location</li>
              <li>Pages visited, search queries, and time spent on the platform</li>
              <li>Referring URLs and click-through data</li>
              <li>Push notification tokens (with your permission)</li>
              <li>Crash reports and performance diagnostics</li>
            </ul>

            <p className="font-semibold text-gray-900 mt-4">
              Information from third parties:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Google account information if you sign in with Google</li>
              <li>Social media profile data if you connect social accounts</li>
              <li>Payment verification data from mobile money providers</li>
            </ul>
          </Section>

          {/* 3 */}
          <Section id="how-we-use" title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create and manage your account</li>
              <li>Process orders, payments, and deliveries</li>
              <li>Personalise your shopping experience and product recommendations</li>
              <li>Send transactional emails and order status notifications</li>
              <li>Send promotional communications (you can opt out at any time)</li>
              <li>Respond to customer support requests</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations</li>
              <li>Improve our platform through analytics and A/B testing</li>
              <li>Display relevant advertisements on and off our platform</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section id="sharing" title="4. Sharing Your Information">
            <p>
              We do <strong>not</strong> sell your personal information. We may share your
              data only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Sellers:</strong> Your name, delivery address, and phone number are
                shared with the seller to fulfil your order.
              </li>
              <li>
                <strong>Delivery partners:</strong> Logistics providers receive your name,
                address, and contact details to complete delivery.
              </li>
              <li>
                <strong>Payment processors:</strong> Payment details are shared with
                licensed payment providers (e.g., mobile money operators) to process
                transactions.
              </li>
              <li>
                <strong>Service providers:</strong> We use trusted third-party services
                (cloud hosting, image storage, analytics) that process data on our behalf
                under strict data-processing agreements.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information when
                required by law, court order, or government authority.
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger or
                acquisition, your data may be transferred as part of that transaction.
              </li>
            </ul>
          </Section>

          {/* 5 */}
          <Section id="permissions" title="5. App Permissions">
            <p>
              Our mobile application requests the following device permissions. All
              permissions are requested only when needed and only with your explicit
              consent:
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700 border-b border-gray-200">
                      Permission
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700 border-b border-gray-200">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["READ_MEDIA_IMAGES", "Upload product photos, profile pictures, and review images from your gallery"],
                    ["CAMERA", "Take photos for product listings, profile pictures, and support requests"],
                    ["READ / WRITE_EXTERNAL_STORAGE", "Save downloaded receipts and product images to your device"],
                    ["INTERNET", "Connect to our servers to browse products and process orders"],
                    ["ACCESS_NETWORK_STATE", "Detect connectivity to provide offline-friendly error messages"],
                    ["POST_NOTIFICATIONS", "Send order updates, delivery alerts, and promotional messages"],
                    ["RECEIVE_BOOT_COMPLETED", "Restart background notification service after device reboot"],
                    ["VIBRATE", "Vibrate device for incoming notification alerts"],
                    ["RECORD_AUDIO", "Voice search and AI assistant voice input (optional feature)"],
                  ].map(([perm, desc]) => (
                    <tr key={perm} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-blue-700 whitespace-nowrap">
                        {perm}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              You can revoke any permission at any time through your device settings.
              Revoking a permission may limit certain app features.
            </p>
          </Section>

          {/* 6 */}
          <Section id="cookies" title="6. Cookies & Tracking Technologies">
            <p>
              We use cookies and similar tracking technologies on our website to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Keep you signed in between sessions (authentication cookies)</li>
              <li>Remember your cart and wishlist items</li>
              <li>Understand how visitors use our website (analytics)</li>
              <li>Deliver relevant advertisements</li>
              <li>Prevent fraud and improve security</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may
              affect your ability to sign in or use certain features. We honour
              &quot;Do Not Track&quot; signals where technically feasible.
            </p>
          </Section>

          {/* 7 */}
          <Section id="data-retention" title="7. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or
              as needed to provide our services. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Account data is retained until you delete your account</li>
              <li>Order history is retained for 7 years for legal and tax purposes</li>
              <li>Chat messages are retained for 2 years</li>
              <li>Analytics data is anonymised after 26 months</li>
              <li>Deleted account data is purged within 30 days</li>
            </ul>
          </Section>

          {/* 8 */}
          <Section id="security" title="8. Data Security">
            <p>
              We implement industry-standard security measures to protect your personal
              information:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All data transmitted between your device and our servers is encrypted using TLS/HTTPS</li>
              <li>Passwords are hashed using bcrypt — we never store plain-text passwords</li>
              <li>Payment data is processed by PCI-DSS compliant payment providers</li>
              <li>Access to personal data is restricted to authorised personnel only</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Images are stored securely on ImageKit CDN with access controls</li>
            </ul>
            <p className="mt-3">
              Despite our best efforts, no method of transmission over the internet is 100%
              secure. If you suspect a security breach, please contact us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          {/* 9 */}
          <Section id="your-rights" title="9. Your Rights">
            <p>
              Depending on your location, you may have the following rights regarding your
              personal data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Access:</strong> Request a copy of the personal data we hold about
                you
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate information via
                your profile settings
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and associated
                data
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a machine-readable
                format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing emails at any time
                using the link in any email
              </li>
              <li>
                <strong>Restrict processing:</strong> Ask us to limit how we use your data
                in certain circumstances
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on legitimate interests
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          {/* 10 */}
          <Section id="children" title="10. Children's Privacy">
            <p>
              {APP_NAME} is not directed at children under the age of 13. We do not
              knowingly collect personal information from children under 13. If you believe
              a child has provided us with personal information, please contact us
              immediately and we will delete that information.
            </p>
            <p>
              Users between 13 and 18 years of age should use the platform only with the
              consent and supervision of a parent or legal guardian.
            </p>
          </Section>

          {/* 11 */}
          <Section id="third-party" title="11. Third-Party Services">
            <p>
              Our platform integrates with the following third-party services, each with
              their own privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>ImageKit</strong> — Image storage and CDN (
                <a
                  href="https://imagekit.io/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Google Sign-In</strong> — Authentication (
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Expo / React Native</strong> — Mobile app framework and push
                notifications
              </li>
              <li>
                <strong>MongoDB Atlas</strong> — Cloud database hosting
              </li>
              <li>
                <strong>Vercel</strong> — Web hosting and edge network
              </li>
              <li>
                <strong>Mobile Money Providers</strong> — MTN MoMo, Airtel Money for
                payment processing
              </li>
            </ul>
            <p className="mt-3">
              We are not responsible for the privacy practices of third-party services.
              We encourage you to review their privacy policies.
            </p>
          </Section>

          {/* 12 */}
          <Section id="international" title="12. International Data Transfers">
            <p>
              Your information may be transferred to and processed in countries other than
              Uganda, including the United States and European Union, where our service
              providers operate. We ensure that such transfers comply with applicable data
              protection laws and that appropriate safeguards are in place.
            </p>
          </Section>

          {/* 13 */}
          <Section id="changes" title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make significant
              changes, we will:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Update the &quot;Last updated&quot; date at the top of this page</li>
              <li>Send an email notification to registered users</li>
              <li>Display a prominent notice in the app</li>
            </ul>
            <p className="mt-3">
              Your continued use of {APP_NAME} after changes are posted constitutes your
              acceptance of the updated policy.
            </p>
          </Section>

          {/* 14 */}
          <Section id="contact" title="14. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy
              Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mt-3 space-y-2 text-sm">
              <p>
                <strong>Company:</strong> {COMPANY}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a href={WEBSITE} className="text-blue-600 underline">
                  {WEBSITE}
                </a>
              </p>
              <p>
                <strong>Location:</strong> Kampala, Uganda
              </p>
            </div>
          </Section>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              ← Back to Home
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About Us
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-blue-600 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}
