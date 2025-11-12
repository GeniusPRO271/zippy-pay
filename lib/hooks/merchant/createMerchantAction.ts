"use client";

import { CreateMerchantFormType } from "@/lib/zod/createMerchant";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

async function createMerchantAction(data: CreateMerchantFormType) {
  const res = await fetch("/api/merchants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create merchant");
  return res.json();
}

export function useCreateMerchant() {
  return useMutation({
    mutationFn: createMerchantAction,
    onError: (error) => {
      toast("Something went wrong while creating the merchant.");
    },
    onSuccess: () => toast("Merchant created! The merchant has been successfully added."),
  });
}
