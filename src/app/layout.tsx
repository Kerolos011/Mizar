import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIZAR | متجرك الإلكتروني في 5 دقائق",
  description:
    "منصة مصرية تساعد البائعين على إنشاء وإدارة متجر إلكتروني احترافي بدون مبرمج أو خبرة تقنية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}