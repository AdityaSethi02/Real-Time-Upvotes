import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ChatBoard — Real-time Chat Ranked by Upvotes",
  description:
    "A real-time chatroom where the community decides what matters. Built with FastAPI, WebSockets, and Next.js.",
  openGraph: {
    title: "ChatBoard",
    description: "Real-time chat ranked by community upvotes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
