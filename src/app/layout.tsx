import type { Metadata } from "next";
import { organizationSchema } from "@/lib/schema";
import { SkipToContent } from "@/components/SkipToContent";
import { LazyWeChatConsultModal } from "@/components/shared/LazyWeChatConsultModal";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lanhui.com"),
  title: "蓝辉轻改 LANHUI | 汽车轻改装与车身膜服务",
  description:
    "蓝辉轻改专注汽车轻改装与车身膜服务，提供电动踏板、轮毂、底盘升级、汽车窗膜、改色膜、隐形车衣等一站式方案，当前服务门店为顺德大良店。",
  keywords:
    "蓝辉轻改, LANHUI, 汽车轻改, 电动踏板, 轮毂升级, 底盘升级, 汽车窗膜, 改色膜, 隐形车衣, 顺德大良汽车改装",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "蓝辉轻改 LANHUI | 汽车轻改装与车身膜服务",
    description:
      "蓝辉轻改专注汽车轻改装与车身膜服务，提供一站式轻改装备与汽车膜系方案，当前服务门店为顺德大良店。",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white" suppressHydrationWarning>
        <SkipToContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationSchema()),
          }}
        />
        {children}
        <LazyWeChatConsultModal />
      </body>
    </html>
  );
}
