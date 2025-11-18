import axios from "axios";

export interface PayInRequest {
  merchantId: string;
  transactionId: string;
  country: string;
  currency: string;
  payMethod: string;
  documentId: string;
  amount: string;
  email: string;
  name: string;
  timestamp: string;
  payinExpirationTime: string;
  url_OK: string;
  url_ERROR: string;
}

export interface PayInResponse {
  status: "ok" | "error";
  url?: string;
  description?: string;
}

export async function createPayIn(payload: PayInRequest) {
  const { data } = await axios.post<PayInResponse>(
    "https://api-dot-zippy-dev-payments.rj.r.appspot.com/pay",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return data;
}
