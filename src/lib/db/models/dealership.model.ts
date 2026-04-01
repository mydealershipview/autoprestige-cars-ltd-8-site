import mongoose, { Schema, Model } from "mongoose";
import type { DealershipInfo } from "../../../types/dealership";

/**
 * Internal document shape — extends DealershipInfo with the sentinel field
 * used to identify the single settings document in the collection.
 */
type DealershipDocument = DealershipInfo & {
  _isDealershipSettings: true;
};

const AddressSchema = new Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    postcode: { type: String, default: "" },
    country: { type: String, default: "UK" },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  { _id: false }
);

const OpeningHoursSchema = new Schema(
  {
    weekdays: { type: String, default: "Monday – Friday: 9am – 6pm" },
    saturday: { type: String, default: "Saturday: 9am – 5pm" },
    sunday: { type: String, default: "Sunday: 10am – 4pm" },
  },
  { _id: false }
);

const DealershipSchema = new Schema<DealershipDocument>(
  {
    // Sentinel to locate the single settings document
    _isDealershipSettings: { type: Boolean, default: true, index: true },

    name: { type: String, required: true },
    tagline: { type: String, default: "Your trusted local car dealership" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    logoUrl: { type: String, default: "" },

    address: { type: AddressSchema, default: () => ({}) },
    social: { type: SocialLinksSchema, default: () => ({}) },
    openingHours: { type: OpeningHoursSchema, default: () => ({}) },

    companyNumber: { type: String, default: "" },
    fcaNumber: { type: String, default: "" },
    seoText: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "dealership_settings",
  }
);

/**
 * Singleton model registration — safe to call multiple times via hot reload.
 */
const DealershipModel: Model<DealershipDocument> =
  (mongoose.models.DealershipSettings as Model<DealershipDocument>) ??
  mongoose.model<DealershipDocument>("DealershipSettings", DealershipSchema);

export default DealershipModel;
