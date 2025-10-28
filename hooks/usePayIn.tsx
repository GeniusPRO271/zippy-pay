"use client";

import { useMutation } from "@tanstack/react-query";
import { createPayIn, PayInRequest, PayInResponse } from "@/lib/api/zippy";
import { toast } from "sonner";

export function usePayIn() {
  return useMutation<PayInResponse, Error, PayInRequest>({
    mutationFn: (payload: PayInRequest) => createPayIn(payload),
    onSuccess: (data) => {
      if (data.status === "ok" && data.url) {
        window.location.href = data.url;
      } else {
        alert(`Payment error: ${data.description ?? "Unknown error"}`);
      }
    },
    onError: () => {
      toast("Error paying in")
    }
  });
}
