export type Address = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
};

export type OpeningHours = {
  weekdays: string;
  saturday: string;
  sunday: string;
};
/**
 * The shape of dealership information returned by getDealershipInfo().
 * This data is stored in MongoDB and seeded with defaults on first run.
 */
export type DealershipInfo = {
  /** Display name of the dealership, e.g. "Empire Autos" */
  name: string;
  /** Short tagline shown beneath the name */
  tagline: string;
  /** Primary contact email */
  email: string;
  /** Primary contact phone number */
  phone: string;
  /** WhatsApp number (e.g. "447700900000" — country code, no +) */
  whatsapp: string;
  /** Physical address */
  address: Address;
  /** Absolute URL to the dealership logo image */
  logoUrl: string;
  /** Social media profile URLs */
  social: SocialLinks;
  /** Opening hours strings shown in UI */
  openingHours: OpeningHours;
  /** Companies House registration number */
  companyNumber: string;
  /** FCA authorisation number */
  fcaNumber: string;
  /** SEO text block rendered on pages for search engine visibility */
  seoText: string;
};
