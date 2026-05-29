import mongoose, { Schema, Model } from 'mongoose'

/**
 * Stores admin-editable overrides for DMS vehicles.
 * Only modified fields are saved here. All other data continues to
 * come from the DMS API. Keyed by `stockId` from AutoTrader/DMS metadata.
 */
export interface IVehicleOverride {
  /** DMS stockId — unique identifier for the vehicle */
  stockId: string
  /** Override for adverts.retailAdverts.attentionGrabber */
  attentionGrabber?: string | null
  /** Optional reservation status banner displayed below the attention grabber */
  reservationStatus?: string | null
  /** Override for adverts.forecourtPrice.amountGBP / retailAdverts.totalPrice.amountGBP */
  listingPrice?: number | null
  createdAt: Date
  updatedAt: Date
}

const VehicleOverrideSchema = new Schema<IVehicleOverride>(
  {
    stockId: { type: String, required: true, unique: true, index: true },
    attentionGrabber: { type: String, default: null },
    reservationStatus: { type: String, default: null },
    listingPrice: { type: Number, default: null },
  },
  { timestamps: true },
)

const VehicleOverrideModel: Model<IVehicleOverride> =
  (mongoose.models.VehicleOverride as Model<IVehicleOverride>) ||
  mongoose.model<IVehicleOverride>('VehicleOverride', VehicleOverrideSchema)

export default VehicleOverrideModel
