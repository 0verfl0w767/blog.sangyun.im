import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SangYun's Blog",
    template: "%s | SangYun's Blog",
  },
  description: "개발과 기술에 대한 이야기를 나누는 블로그입니다.",
  openGraph: {
    title: "SangYun's Blog",
    description: "개발과 기술에 대한 이야기를 나누는 블로그입니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {/* Header */}
        <header className="border-b border-gray-100">
          <nav className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight hover:text-gray-600 transition-colors"
            >
              SangYun's Blog
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                글 목록
              </Link>
              <Link
                href="/admin"
                className="hover:text-gray-900 transition-colors"
              >
                글 쓰기
              </Link>
            </div>
          </nav>
        </header>

        {/* Main */}
        <main className="px-6 md:px-8 py-10">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-20">
          <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SangYun. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
