// app/api/merchants/route.ts
import { createMerchant } from "@/actions/merchant/createMerchant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  await createMerchant(data)

  return NextResponse.json({ success: true, message: "Merchant created" });
}
