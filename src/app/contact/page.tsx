import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Send,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { stores } from "@/lib/store";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "预约咨询 | 蓝辉轻改 LANHUI",
  description:
    "预约蓝辉轻改顺德大良店咨询轻改装备与汽车膜系服务，可到店沟通或留言预约。",
};

export default function ContactPage() {
  const store = stores[0];
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              CONTACT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">预约咨询</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              留下您的联系方式与用车场景，或直接到 {brand.currentStore} 沟通。
            </p>
          </div>
        </section>

        {/* Body grid */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  提交预约意向
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  填写下面的信息，提交后我们会尽快与您联系。表单后端为静态
                  mailto：
                  点击「发送邮件」会唤起您的本地邮件客户端，所有内容会预填到邮件正文。
                </p>

                <form
                  action={`mailto:${brand.email}`}
                  method="post"
                  encType="text/plain"
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="name" label="称呼" required>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="请输入您的称呼"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </Field>
                    <Field id="phone" label="联系电话" required>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        pattern="[0-9+\-\s]{6,20}"
                        placeholder="请输入手机号"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="city" label="所在城市">
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="如：佛山"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </Field>
                    <Field id="car" label="车型">
                      <input
                        id="car"
                        name="car"
                        type="text"
                        placeholder="如：理想 L7 2024 款"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </Field>
                  </div>

                  <Field id="service" label="意向服务">
                    <select
                      id="service"
                      name="service"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        请选择意向服务
                      </option>
                      <option value="electric-steps">电动踏板</option>
                      <option value="wheels">轮毂升级</option>
                      <option value="chassis">底盘升级</option>
                      <option value="window-film">汽车窗膜</option>
                      <option value="color-film">改色膜</option>
                      <option value="ppf">隐形车衣</option>
                      <option value="other">其他 / 暂不确定</option>
                    </select>
                  </Field>

                  <Field id="message" label="用车场景与想法">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="简单描述用车场景、希望改善的地方、预算等"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors resize-y"
                    />
                  </Field>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-base font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-900/30 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    发送邮件
                  </button>

                  <p className="text-xs text-zinc-500 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      提交即表示您同意蓝辉轻改仅将上述信息用于本次预约联系。
                      品牌不会向第三方分享您的信息。
                    </span>
                  </p>
                </form>
              </div>
            </div>

            {/* Store info + direct contacts */}
            <aside className="space-y-4">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  {store ? store.name : brand.currentStore}
                </h2>
                <dl className="space-y-4 text-sm">
                  <InfoRow icon={MapPin} label="门店地址">
                    {store ? store.address : brand.address}
                  </InfoRow>
                  <InfoRow icon={Phone} label="联系电话">
                    {store ? store.phone : brand.phone}
                  </InfoRow>
                  <InfoRow icon={Clock} label="营业时间">
                    {store ? store.businessHours : brand.businessHours}
                  </InfoRow>
                </dl>
                <div className="mt-5 pt-5 border-t border-zinc-800 space-y-2">
                  <Link
                    href={`/agent/store/${store?.id ?? "shunde-daliang"}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    查看门店详情
                  </Link>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  沟通建议
                </h2>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>提前 1-2 天预约，到店沟通更顺畅</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>带车辆行驶证，便于确认车型与年款</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>膜系服务建议预留 1-3 天施工时间</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-zinc-600 text-center pt-2">
                邮件：{brand.email}
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-200 mb-1.5"
      >
        {label}
        {required && <span className="text-orange-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
      <div>
        <dt className="text-xs uppercase tracking-wider text-zinc-500 mb-0.5">
          {label}
        </dt>
        <dd className="text-zinc-200 leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}
