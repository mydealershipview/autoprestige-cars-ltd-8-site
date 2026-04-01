import { cache } from "react";
import connectDB from "@/lib/db/connect";
import DealershipModel from "@/lib/db/models/dealership.model";
import type { DealershipInfo } from "../../types/dealership";

/**
 * Builds the default DealershipInfo, seeded from environment variables
 * where applicable. Used both as the initial DB document and as the
 * fallback when the database is unreachable.
 */
function buildDefaults(): DealershipInfo {
  const rawId = process.env.DEALER_ID ?? "";
  const name = rawId
    ? rawId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "My Dealership";

  return {
    name,
    tagline: "Your trusted local car dealership",
    email: process.env.DEALER_EMAIL ?? "info@dealership.co.uk",
    phone: "",
    whatsapp: "",
    address: {
      line1: "123 Motor Way",
      line2: "",
      city: "London",
      postcode: "W1A 1AA",
      country: "UK",
    },
    logoUrl: "",
    social: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      tiktok: "",
      linkedin: "",
    },
    openingHours: {
      weekdays: "Monday – Friday: 9am – 6pm",
      saturday: "Saturday: 9am – 5pm",
      sunday: "Sunday: 10am – 4pm",
    },
    companyNumber: "",
    fcaNumber: "",
    seoText: "",
  };
}

/**
 * Fetches the dealership's display information from MongoDB.
 *
 * - On first run with an empty database, automatically seeds the document
 *   with defaults derived from the environment variables.
 * - Wrapped in React's `cache()` so it is deduplicated within a single
 *   request — e.g. `generateMetadata` and the root layout both call this
 *   but only one database query is made.
 * - If the database is unreachable (e.g. during a build without DATABASE_URI),
 *   it falls back gracefully to the env-based defaults so the build succeeds.
 */
export const getDealershipInfo = cache(async (): Promise<DealershipInfo> => {
  try {
    await connectDB();

    // findOneAndUpdate with upsert acts as getOrCreate — atomic and safe
    const doc = await DealershipModel.findOneAndUpdate(
      { _isDealershipSettings: true },
      { $setOnInsert: { ...buildDefaults(), _isDealershipSettings: true } },
      { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
    );

    if (!doc) {
      return buildDefaults();
    }

    return {
      name: doc.name,
      tagline: doc.tagline,
      email: doc.email,
      phone: doc.phone,
      whatsapp: doc.whatsapp,
      address: {
        line1: doc.address?.line1 ?? "",
        line2: doc.address?.line2 ?? "",
        city: doc.address?.city ?? "",
        postcode: doc.address?.postcode ?? "",
        country: doc.address?.country ?? "UK",
      },
      logoUrl: doc.logoUrl,
      social: {
        facebook: doc.social?.facebook ?? "",
        instagram: doc.social?.instagram ?? "",
        twitter: doc.social?.twitter ?? "",
        youtube: doc.social?.youtube ?? "",
        tiktok: doc.social?.tiktok ?? "",
        linkedin: doc.social?.linkedin ?? "",
      },
      openingHours: {
        weekdays: doc.openingHours?.weekdays ?? "Monday – Friday: 9am – 6pm",
        saturday: doc.openingHours?.saturday ?? "Saturday: 9am – 5pm",
        sunday: doc.openingHours?.sunday ?? "Sunday: 10am – 4pm",
      },
      companyNumber: doc.companyNumber ?? "",
      fcaNumber: doc.fcaNumber ?? "",
      seoText: doc.seoText ?? "",
    };
  } catch (err) {
    // Database unavailable — return env-based defaults so pages still render
    console.error("[dealership.service] Failed to fetch from DB:", err);
    return buildDefaults();
  }
});
