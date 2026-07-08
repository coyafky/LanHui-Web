import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor")) {
    return Response.json({ success: false, error: "权限不足" }, { status: 403 });
  }

  return Response.json({
    success: true,
    data: {
      structuredLogging: true,
      logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
      apmConfigured: Boolean(process.env.SENTRY_DSN),
      requestId: true,
      sanitization: true,
    },
  });
}
