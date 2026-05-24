import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "opengc - open.global.chat — One Room. Everyone's In It.",
    template: "%s | open.global.chat",
  },
  description:
    "A real-time global chat room where everyone connects instantly. No sign-up hassle, no channels, no threads — just pure live conversation. Built with Next.js, WebSockets, and Redis.",

  keywords: [
    "global chat",
    "opnegc",
    "real-time chat",
    "open chat room",
    "live chat",
    "websocket chat",
    "anonymous chat",
    "public chat room",
    "open source chat",
    "next.js chat app",
    "masterutsav",
    "open gc",
    "open global chat",
  ],

  authors: [
    { name: "Utsav Jaiswal", url: "https://www.masterutsav.in" },
  ],

  creator: "Utsav Jaiswal",
  publisher: "Utsav Jaiswal",

  category: "technology",

  metadataBase: new URL(
    process.env.DOMAIN ?? "https://opengc.masterxcode.xyz"
  ),

  alternates: {
    canonical: "/",
  },
  // verification: {
  //   google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  // },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "open.global.chat — One Room. Everyone's In It.",
    description:
      "A real-time global chat room. No sign-up hassle, no channels — just live conversation with everyone. With a Private Room Feature",
    url: process.env.DOMAIN ?? "https://opengc.masterxcode.xyz",
    siteName: "open.global.chat",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/screen_main.png",
        width: 1200,
        height: 630,
        alt: "open.global.chat — real-time global chat room UI",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "open.global.chat — One Room. Everyone's In It.",
    description:
      "Real-time global chat. No channels, no threads — just signal. Built by @masterutsav01",
    images: ["/images/screen_main.png"],
    creator: "@masterutsav01",
    site: "@masterutsav01",
  },

  applicationName: "open.global.chat",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "open.global.chat",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
