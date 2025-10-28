export interface Transaction {
  id: string; // UUID, primary key
  merchantId: string;
  transactionId: string; // unique per request
  amount: string; // stored as string for precision (numeric in DB)
  currency: "CLP" | "MXN" | "USD" | "PEN" | "BRL" | "ARS" | "COP";
  country: "CL" | "PE" | "EC" | "BR" | "CO" | "PA" | "CR" | "GT" | "MX" | "AR";
  payMethod: "bankCard" | "bankTransfer" | "cash" | "skin";
  documentId?: string;
  email: string;
  name: string;
  status: "pending" | "validated" | "error";
  message?: string;
  zippyId?: string;
  sign?: string;
  createdAt: Date;
  updatedAt: Date;
}

