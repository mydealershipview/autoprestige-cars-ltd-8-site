import mongoose, { Model, Schema } from 'mongoose'

export interface IRegPlate {
  plate: string
  slug: string
  price?: number | null
  showPriceOnCard: boolean
  teaser: string
  details: string
  active: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const RegPlateSchema = new Schema<IRegPlate>(
  {
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      default: null,
      min: 0,
    },
    showPriceOnCard: {
      type: Boolean,
      default: false,
    },
    teaser: {
      type: String,
      default: '',
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'reg_plates',
  },
)

const RegPlateModel: Model<IRegPlate> =
  (mongoose.models.RegPlate as Model<IRegPlate>) ||
  mongoose.model<IRegPlate>('RegPlate', RegPlateSchema)

export default RegPlateModel
