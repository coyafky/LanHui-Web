/** Safe JSON-LD serializer — prevents script tag breakout via user content */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, "<\\/");
}
