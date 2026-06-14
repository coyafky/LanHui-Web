import { STORE_REGIONS } from "@/lib/store-regions";

export async function GET() {
  return Response.json({ success: true, data: STORE_REGIONS });
}