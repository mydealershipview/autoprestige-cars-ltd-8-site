import mongoose, { Model, Schema } from 'mongoose'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

export interface ISoldCar {
  stockId: string
  registration?: string | null
  make?: string | null
  model?: string | null
  derivative?: string | null
  soldDate: Date
  firstSeenAt: Date
  showAfter30Days: boolean
  vehicle: AutoTraderVehicle
  createdAt: Date
  updatedAt: Date
}

const SoldCarSchema = new Schema<ISoldCar>(
  {
    stockId: { type: String, required: true, unique: true, index: true, trim: true },
    registration: { type: String, default: null, trim: true, index: true },
    make: { type: String, default: null, trim: true, index: true },
    model: { type: String, default: null, trim: true, index: true },
    derivative: { type: String, default: null, trim: true },
    soldDate: { type: Date, required: true, index: true },
    firstSeenAt: { type: Date, required: true, default: Date.now },
    showAfter30Days: { type: Boolean, default: false, index: true },
    vehicle: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'sold_cars' },
)

const SoldCarModel: Model<ISoldCar> =
  (mongoose.models.SoldCar as Model<ISoldCar>) ||
  mongoose.model<ISoldCar>('SoldCar', SoldCarSchema)

export default SoldCarModel
