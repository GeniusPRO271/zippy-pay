export interface ContriesSelect {
  id: "CL" | "EC" | "BR";
  label: string;
}

export const countriesData: ContriesSelect[] = [
  { id: "CL", label: "Chile 🇨🇱" },
  { id: "EC", label: "Ecuador 🇪🇨" },
  { id: "BR", label: "Brazil 🇧🇷" },
];
