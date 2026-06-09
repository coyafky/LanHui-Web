/**
 * Admin 最外层布局
 *
 * 仅做基础包裹，不做 auth 检查。
 * login 页面在此 layout 之下，不受 (dashboard) layout 影响。
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
