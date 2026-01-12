export interface Country {
  id: string;
  isoCode: string;
  iso3: string;
  name: string;
  phonePrefix: string | null;
  currency: string;
  timezone: string | null;
  flagUrl: string | null;
  createdAt: Date;
}
