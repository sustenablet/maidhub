import type { Metadata } from "next";
import { Fraunces, Syne } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  weight: "variable",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaidHub — Run your cleaning business like a pro",
  description:
    "The back-office OS for solo residential cleaners. Manage clients, schedule recurring jobs, send professional invoices — all in one place.",
  openGraph: {
    title: "MaidHub — Run your cleaning business like a pro",
    description:
      "The back-office OS for solo residential cleaners. Manage clients, schedule recurring jobs, send professional invoices.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${syne.variable}`}
      style={{ fontFamily: "var(--font-ui, system-ui, sans-serif)" }}
    >
      {children}
    </div>
  );
}
