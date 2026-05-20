import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会議室予約システム",
  description: "社内向けオンライン会議室予約システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
