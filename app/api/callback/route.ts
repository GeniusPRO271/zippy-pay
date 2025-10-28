import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      AMOUNT,
      MERCHANTREQUESTID,
      CODE,
      MESSAGE,
      SIGN,
      ZIPPYID,
    } = data;

    const SECRET_KEY = process.env.ZIPPY_SECRET_KEY || "";
    const rawSignature = `${AMOUNT}${MERCHANTREQUESTID}${CODE}${ZIPPYID}${SECRET_KEY}`;

    const expectedSign = crypto
      .createHash("md5")
      .update(rawSignature)
      .digest("hex");

    if (SIGN !== expectedSign) {
      console.error("Invalid signature:", SIGN);
      return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 400 });
    }

    console.log("✅ Callback received:", {
      AMOUNT,
      MERCHANTREQUESTID,
      CODE,
      MESSAGE,
      ZIPPYID,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
