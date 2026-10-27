import type { Metadata } from "next";
import { Space_Grotesk, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

// Hindi / Devanagari font — loaded alongside Latin fonts.
// The browser automatically uses it when Hindi characters are rendered.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JanSamadhan — Civic Problem Solving Platform",
  description:
    "Connect citizens, universities, and industry partners to solve local community problems",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoDevanagari.variable}`}
    >
      <body className="font-sans antialiased bg-[#faf9f6] text-[#171e19]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
