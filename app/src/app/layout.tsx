import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaidHub — Solo Cleaner OS",
  description:
    "The back-office command center for solo cleaning business owners. Manage clients, schedule jobs, send invoices.",
  metadataBase: new URL("https://app.maidhub.io"),
  openGraph: {
    title: "MaidHub — Solo Cleaner OS",
    description: "Manage clients, schedule jobs, and send invoices. Built for solo cleaners.",
    siteName: "MaidHub",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MaidHub — Solo Cleaner OS",
    description: "Manage clients, schedule jobs, and send invoices. Built for solo cleaners.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
