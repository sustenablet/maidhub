import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import Nav from "./_components/Nav";
import Footer from "./_components/Footer";
import "./marketing.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaidHub — Run your cleaning business like a pro",
  description:
    "The back-office OS for solo residential cleaners. Manage clients, schedule recurring jobs, send professional invoices — all in one place.",
  openGraph: {
    title: "MaidHub — Run your cleaning business like a pro",
    description:
      "The all-in-one platform for solo house cleaners. Clients, scheduling, invoicing — done.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} ${lora.variable}`} style={{ fontFamily: "var(--font-ui)" }}>
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
