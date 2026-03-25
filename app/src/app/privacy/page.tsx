import Link from "next/link";
import { DM_Sans } from "next/font/google";

const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Privacy Policy — MaidHub",
  description: "How MaidHub collects, uses, and protects your information.",
};

const sections = [
  {
    num: "01",
    title: "Introduction",
    body: [
      `MaidHub ("we," "our," or "us") operates a business management platform for solo cleaning business owners. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.`,
      `By using MaidHub, you agree to the collection and use of information in accordance with this policy.`,
    ],
  },
  {
    num: "02",
    title: "Information We Collect",
    body: [
      `Account information: When you create an account, we collect your name, email address, and business name.`,
      `Business data: Information you enter about your clients, jobs, invoices, and estimates. This data belongs to you and is stored securely in our database.`,
      `Payment information: We use Square to process payments. We do not store your full payment card information. Square's privacy policy governs how payment data is handled.`,
      `Usage data: We may collect information about how you interact with our platform (page visits, feature usage) to improve the service.`,
    ],
  },
  {
    num: "03",
    title: "How We Use Your Information",
    bullets: [
      "Provide, maintain, and improve the MaidHub platform",
      "Process transactions and send related information",
      "Send account notifications and service updates",
      "Respond to your comments and questions",
      "Monitor usage to detect and prevent fraud or abuse",
      "Comply with legal obligations",
    ],
  },
  {
    num: "04",
    title: "Data Storage and Security",
    body: [
      `Your data is stored using Supabase, a secure cloud database provider hosted on AWS. We use row-level security to ensure each user can only access their own data.`,
      `We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
    ],
  },
  {
    num: "05",
    title: "Data Sharing",
    body: [`We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our platform:`],
    bullets: [
      "Supabase — database and authentication",
      "Square — payment processing",
      "Vercel — application hosting",
    ],
    bodyAfter: [`These providers are bound by their own privacy policies and are contractually obligated to protect your information.`],
  },
  {
    num: "06",
    title: "Your Rights",
    body: [`You have the right to:`],
    bullets: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate data",
      "Request deletion of your account and associated data",
      "Export your data in a portable format",
      "Opt out of non-essential communications",
    ],
    bodyAfter: [`To exercise these rights, contact us at the email below.`],
  },
  {
    num: "07",
    title: "Cookies",
    body: [`We use essential cookies to maintain your authenticated session. We do not use cookies for advertising or tracking across third-party websites.`],
  },
  {
    num: "08",
    title: "Children's Privacy",
    body: [`MaidHub is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.`],
  },
  {
    num: "09",
    title: "Changes to This Policy",
    body: [`We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice in the application or sending an email to your registered address.`],
  },
];

export default function PrivacyPage() {
  return (
    <div className={`${sans.className} min-h-screen bg-[#111111]`}>
      {/* Nav */}
      <header className="border-b border-[#1E1E1E] bg-[#111111]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-[5px] bg-[#0071E3] flex items-center justify-center">
              <span className="text-white font-bold text-[13px] leading-none">M</span>
            </div>
            <span className="text-[#D4D4D4] font-bold text-[15px] tracking-[-0.02em]">MaidHub</span>
          </Link>
          <Link
            href="/login"
            className="text-[13px] font-medium text-[#555555] hover:text-[#D4D4D4] transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0071E3] mb-4">Legal</p>
          <h1 className="text-[40px] font-bold text-[#D4D4D4] tracking-[-0.04em] leading-none mb-3">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-[#555555]">Last updated: March 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-1">
          {sections.map((s) => (
            <div key={s.num} className="group border border-[#1E1E1E] rounded-[6px] bg-[#141414] px-7 py-6 hover:border-[#2C2C2C] transition-colors">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-[11px] font-bold text-[#333333] tabular-nums shrink-0">{s.num}</span>
                <h2 className="text-[15px] font-bold text-[#D4D4D4] tracking-[-0.02em]">{s.title}</h2>
              </div>
              <div className="pl-8 space-y-3 text-[13px] text-[#888888] leading-relaxed">
                {s.body?.map((p, i) => <p key={i}>{p}</p>)}
                {s.bullets && (
                  <ul className="space-y-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1 w-1 rounded-full bg-[#0071E3] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.bodyAfter?.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="border border-[#1E1E1E] rounded-[6px] bg-[#141414] px-7 py-6 hover:border-[#2C2C2C] transition-colors">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[11px] font-bold text-[#333333] tabular-nums shrink-0">10</span>
              <h2 className="text-[15px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Contact</h2>
            </div>
            <div className="pl-8 space-y-3 text-[13px] text-[#888888] leading-relaxed">
              <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
              <div className="inline-flex items-center gap-3 mt-2 px-4 py-3 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-[6px]">
                <span className="font-bold text-[#D4D4D4]">MaidHub Support</span>
                <span className="text-[#444444]">·</span>
                <a href="mailto:support@maidhub.io" className="text-[#0071E3] hover:underline">support@maidhub.io</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1E1E1E] flex items-center justify-between text-[12px] text-[#444444]">
          <span>© {new Date().getFullYear()} MaidHub</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#888888] transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-[#888888] transition-colors">Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
