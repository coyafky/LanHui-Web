import type { Metadata } from "next";
import { organizationSchema } from "@/lib/schema";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { WeChatConsultModal } from "@/components/shared/WeChatConsultModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "蓝辉轻改 LANHUI | 汽车轻改装与车身膜服务",
  description:
    "蓝辉轻改专注汽车轻改装与车身膜服务，提供电动踏板、轮毂、底盘升级、汽车窗膜、改色膜、隐形车衣等一站式方案，当前服务门店为顺德大良店。",
  keywords:
    "蓝辉轻改, LANHUI, 汽车轻改, 电动踏板, 轮毂升级, 底盘升级, 汽车窗膜, 改色膜, 隐形车衣, 顺德大良汽车改装",
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
    <html lang="zh-CN" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema()),
          }}
        />
        <AnalyticsProvider>
          {children}
          <WeChatConsultModal />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
