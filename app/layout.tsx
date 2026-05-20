import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 기존 metadata를 이렇게 바꿔주세요
export const metadata: Metadata = {
  title: "마인드 로그",
  description: "나의 마음 기록장",
  // 1. 매니페스트 파일 연결
  manifest: "/manifest.json",
  // 2. 아이폰(Apple) 관련 설정
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "마인드 로그",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
