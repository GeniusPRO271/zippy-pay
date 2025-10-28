
// Mock data structure for countries, providers, and payment methods
// This represents the relationship: Country -> Providers -> Payment Methods

export interface Country {
  id: string
  name: string
  code: string
}

export interface Provider {
  id: string
  name: string
  countryIds: string[] // Countries where this provider operates
}

export interface PaymentMethod {
  id: string
  name: string
  providerId: string
  countryIds: string[] // Countries where this method is available
}

// Countries
export const COUNTRIES: Country[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Chile", code: "CL" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Argentina", code: "AR" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Brazil", code: "BR" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Mexico", code: "MX" },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "Colombia", code: "CO" },
]

// Providers with their operating countries
export const PROVIDERS: Provider[] = [
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "Transbank",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"], // Chile only
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440005",
    name: "Kushki",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"], // Chile only
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440002",
    name: "MercadoPago",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001", // Chile
      "550e8400-e29b-41d4-a716-446655440002", // Argentina
      "550e8400-e29b-41d4-a716-446655440003", // Brazil
      "550e8400-e29b-41d4-a716-446655440004", // Mexico
    ],
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440003",
    name: "Stripe",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001", // Chile
      "550e8400-e29b-41d4-a716-446655440002", // Argentina
      "550e8400-e29b-41d4-a716-446655440003", // Brazil
      "550e8400-e29b-41d4-a716-446655440004", // Mexico
      "550e8400-e29b-41d4-a716-446655440005", // Colombia
    ],
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440004",
    name: "PayU",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440005", // Colombia
      "550e8400-e29b-41d4-a716-446655440004", // Mexico
    ],
  },
]

// Payment methods with their provider and country availability
export const PAYMENT_METHODS: PaymentMethod[] = [
  // Transbank methods (Chile only)
  {
    id: "770e8400-e29b-41d4-a716-446655440001",
    name: "Webpay",
    providerId: "660e8400-e29b-41d4-a716-446655440001",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    name: "Cash",
    providerId: "660e8400-e29b-41d4-a716-446655440001",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"],
  },
  // Kushki methods (Chile only)
  {
    id: "770e8400-e29b-41d4-a716-446655440012",
    name: "Credit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440005",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440013",
    name: "Debit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440005",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440014",
    name: "Bank Transfer",
    providerId: "660e8400-e29b-41d4-a716-446655440005",
    countryIds: ["550e8400-e29b-41d4-a716-446655440001"],
  },
  // MercadoPago methods
  {
    id: "770e8400-e29b-41d4-a716-446655440003",
    name: "Credit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440002",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004",
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440004",
    name: "Debit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440002",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440005",
    name: "Bank Transfer",
    providerId: "660e8400-e29b-41d4-a716-446655440002",
    countryIds: ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"],
  },
  // Stripe methods
  {
    id: "770e8400-e29b-41d4-a716-446655440006",
    name: "Credit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440003",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004",
      "550e8400-e29b-41d4-a716-446655440005",
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440007",
    name: "Debit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440003",
    countryIds: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004",
      "550e8400-e29b-41d4-a716-446655440005",
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440008",
    name: "ACH",
    providerId: "660e8400-e29b-41d4-a716-446655440003",
    countryIds: ["550e8400-e29b-41d4-a716-446655440004", "550e8400-e29b-41d4-a716-446655440005"],
  },
  // PayU methods
  {
    id: "770e8400-e29b-41d4-a716-446655440009",
    name: "Credit Card",
    providerId: "660e8400-e29b-41d4-a716-446655440004",
    countryIds: ["550e8400-e29b-41d4-a716-446655440005", "550e8400-e29b-41d4-a716-446655440004"],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440010",
    name: "PSE",
    providerId: "660e8400-e29b-41d4-a716-446655440004",
    countryIds: ["550e8400-e29b-41d4-a716-446655440005"],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440011",
    name: "Cash",
    providerId: "660e8400-e29b-41d4-a716-446655440004",
    countryIds: ["550e8400-e29b-41d4-a716-446655440005", "550e8400-e29b-41d4-a716-446655440004"],
  },
]

export const BUSINESS_TYPES = [
  "E-commerce",
  "Retail",
  "Restaurant",
  "Professional Services",
  "Healthcare",
  "Education",
  "Other",
]

// Helper functions to get filtered data based on selections
export function getAvailableProviders(selectedCountryIds: string[]): Provider[] {
  if (selectedCountryIds.length === 0) return []

  return PROVIDERS.filter((provider) => provider.countryIds.some((countryId) => selectedCountryIds.includes(countryId)))
}

export function getAvailablePaymentMethods(providerId: string, selectedCountryIds: string[]): PaymentMethod[] {
  if (!providerId || selectedCountryIds.length === 0) return []

  return PAYMENT_METHODS.filter(
    (method) =>
      method.providerId === providerId && method.countryIds.some((countryId) => selectedCountryIds.includes(countryId)),
  )
}
