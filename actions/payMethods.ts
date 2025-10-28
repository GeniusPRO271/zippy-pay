import { db } from "@/db";
import { paymentMethods } from "@/db/schema/payment_methods";

export async function getAllCountries() {
  try {
    const result = await db.select().from(paymentMethods);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching countries:", error);
    return { success: false, error: "Failed to fetch payment methods" };
  }
}
