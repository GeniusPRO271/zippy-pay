import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fromFirestoreObjectToDate(obj: { seconds: number; nanoseconds: number }): Date {
  return new Date(obj.seconds * 1000 + obj.nanoseconds / 1_000_000);
}

export function luhnCheck(cardNumber: string): boolean {
  console.log("[DEBUG] CARD NUMBER BEFORE LUNCHECK: ", cardNumber)
  // remove non-digit characters just in case
  const digitsOnly = cardNumber.replace(/\D/g, "");
  if (!/^\d+$/.test(digitsOnly)) return false;

  console.log("[DEBUG] CARD NUMBER AFTER LUNCHECK: ", cardNumber)

  let sum = 0;
  let shouldDouble = false;

  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateRUT(rut: string): boolean {
  console.log("[DEBUG]: validateRUT called with:", rut);

  rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  console.log("[DEBUG]: After cleaning dots/dashes:", rut);

  if (!/^[0-9]+[0-9K]$/.test(rut)) {
    console.log("[DEBUG]: Failed regex test - invalid format");
    return false;
  }
  console.log("[DEBUG]: Passed regex test");

  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  console.log("[DEBUG]: Body:", body, "Check digit:", dv);

  let sum = 0;
  let multiplier = 2;
  const calculations: string[] = [];

  for (let i = body.length - 1; i >= 0; i--) {
    const digit = parseInt(body[i], 10);
    const product = digit * multiplier;
    sum += product;
    calculations.push(`${digit}×${multiplier}=${product}`);
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }

  const expectedDV = 11 - (sum % 11);
  const dvCalc = expectedDV === 11 ? "0" : expectedDV === 10 ? "K" : expectedDV.toString();

  const isValid = dv === dvCalc;

  return isValid;
}

export function maskCL(value: string): string {
  // Chile RUT: 12.345.678-9
  value = value.replace(/\D/g, ""); // keep only digits
  if (value.length > 1) {
    value = value.slice(0, -1) + "-" + value.slice(-1);
  }
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function maskEC(value: string): string {
  // Ecuador cedula: 1234567890 (just digits, max 10)
  return value.replace(/\D/g, "").slice(0, 10);
}

export function toOptions(arr: string[]) {
  return arr.map((item) => ({
    value: item,
    label: item.charAt(0).toUpperCase() + item.slice(1),
  }))
}
