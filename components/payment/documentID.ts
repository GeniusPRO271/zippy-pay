import { maskCL, maskEC, validateRUT } from "@/lib/utils";

export interface DocumentIDCountry {
  id: "CL" | "EC";
  placeholder: string;
  maxLength: number;
  mask: (value: string) => string;
  regex: RegExp;
  errorMessage: string;
  validate?: (value: string) => boolean;
}

export const documentIDCountries: DocumentIDCountry[] = [
  {
    id: "CL",
    placeholder: "12.345.678-9",
    maxLength: 12,
    mask: maskCL,
    regex: /^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$/,
    errorMessage: "RUT must be in format XXXXXXXX-X",
    validate: validateRUT, // your existing Chilean validator
  },
  {
    id: "EC",
    placeholder: "1234567890",
    maxLength: 10,
    mask: maskEC,
    regex: /^[0-9]{10}$/,
    errorMessage: "Cédula must be 10 digits",
  },
];
