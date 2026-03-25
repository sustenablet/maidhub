import Link from "next/link";
import { DM_Sans } from "next/font/google";

const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Terms of Service — MaidHub",
  description: "The terms governing your use of the MaidHub platform.",
};

const sections = [
  {
    num: "01",
    title: "Agreement to Terms",
    body: [
      `By accessing or using MaidHub ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.`,
      `MaidHub is operated as a business management platform for solo residential and small-office cleaning business owners.`,
    ],
  },
  {
    num: "02",
    title: "Use of the Service",
    body: [`You may use the Service only for lawful business purposes. You agree not to:`],
    bullets: [
      "Use the Service for any illegal or unauthorized purpose",
      "Attempt to gain unauthorized access to any part of the Service",
      "Interfere with or disrupt the integrity or performance of the Service",
      "Upload or transmit malicious code or content",
      "Resell or sublicense the Service without written permission",
      "Scrape, crawl, or extract data from the Service using automated means",
    ],
  },
  {
    num: "03",
    title: "Accounts",
    body: [
      `You are responsible for maintaining the security of your account and password. MaidHub cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.`,
      `You are responsible for all content posted and activity that occurs under your account. Each account is for a single user only — one account per cleaning business owner.`,
    ],
  },
  {
    num: "04",
    title: "Free Trial and Subscription",
    body: [
      `MaidHub offers a 30-day free trial upon account creation. No credit card is required to start the trial.`,
      `After the trial period, continued use of the Service requires a paid subscription at the then-current pricing. Subscriptions are billed monthly or annually through our payment processor (Square).`,
      `You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.`,
    ],
  },
  {
    num: "05",
    title: "Your Content",
    body: [
      `You retain ownership of all data and content you enter into MaidHub, including client information, job records, invoices, and estimates ("Your Content").`,
      `By using the Service, you grant MaidHub a limited license to store, process, and display Your Content solely to provide the Service to you.`,
      `You are responsible for ensuring Your Content complies with applicable laws, including data protection regulations governing your clients' personal information.`,
    ],
  },
  {
    num: "06",
    title: "Privacy",
    body: [`Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.`],
    privacyLink: true,
  },
  {
    num: "07",
    title: "Service Availability",
    body: [
      `We strive for high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience outages beyond our control. We are not liable for any loss caused by service downtime.`,
    ],
  },
  {
    num: "08",
    title: "Limitation of Liability",
    body: [
      `To the maximum extent permitted by law, MaidHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.`,
      `Our total liability for any claim arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.`,
    ],
  },
  {
    num: "09",
    title: "Disclaimer of Warranties",
    body: [
      `The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.`,
    ],
  },
  {
    num: "10",
    title: "Termination",
    body: [
      `We reserve the right to suspend or terminate your account at our sole discretion if you violate these Terms or engage in conduct we determine to be harmful to the Service or other users.`,
      `You may delete your account at any time through the Settings page. Upon deletion, your data will be removed within 30 days.`,
    ],
  },
  {
    num: "11",
    title: "Changes to Terms",
    body: [
      `We may modify these Terms at any time. We will provide notice of significant changes by posting an updated version in the application and updating the "Last updated" date above. Continued use of the Service after changes constitutes acceptance.`,
    ],
  },
  {
    num: "12",
    title: "Governing Law",
    body: [
      `These Terms shall be governed by the laws of the United States. Any disputes shall be resolved through binding arbitration rather than in court, except that either party may seek injunctive relief in court for intellectual property violations.`,
    ],
  },
];

export default function TermsPage() {
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
            Terms of Service
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
                {s.body?.map((p, i) =>
                  s.privacyLink && i === 0 ? (
                    <p key={i}>
                      Your use of the Service is also governed by our{" "}
                      <Link href="/privacy" className="text-[#0071E3] hover:underline">
                        Privacy Policy
                      </Link>
                      , which is incorporated into these Terms by reference.
                    </p>
                  ) : (
                    <p key={i}>{p}</p>
                  )
                )}
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
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="border border-[#1E1E1E] rounded-[6px] bg-[#141414] px-7 py-6 hover:border-[#2C2C2C] transition-colors">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[11px] font-bold text-[#333333] tabular-nums shrink-0">13</span>
              <h2 className="text-[15px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Contact</h2>
            </div>
            <div className="pl-8 space-y-3 text-[13px] text-[#888888] leading-relaxed">
              <p>For questions about these Terms, contact us at:</p>
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
            <Link href="/privacy" className="hover:text-[#888888] transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-[#888888] transition-colors">Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
