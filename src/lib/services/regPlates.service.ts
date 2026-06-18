import { cache } from 'react'
import connectDB from '@/lib/db/connect'
import RegPlateModel, { type IRegPlate } from '@/lib/db/models/regPlate.model'
import { REG_PLATES, REG_PLATES_TEASER, plateToSlug, type RegPlateRecord } from '@/data/regPlates'

export type RegPlate = {
  id: string
  plate: string
  slug: string
  price: number | null
  showPriceOnCard: boolean
  teaser: string
  details: string
  active: boolean
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

type LeanRegPlate = IRegPlate & {
  _id: unknown
}

export type RegPlateInput = {
  plate: string
  slug?: string
  price?: number | null
  showPriceOnCard?: boolean
  teaser?: string
  details?: string
  active?: boolean
  displayOrder?: number
}

const DEFAULT_DETAILS =
  "Should you require any further assistance please click the button, fill out the form and we'll be in touch as soon as possible."

function toIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString()
  return undefined
}

function serializePlate(doc: LeanRegPlate): RegPlate {
  return {
    id: String(doc._id),
    plate: doc.plate,
    slug: doc.slug,
    price: doc.price ?? null,
    showPriceOnCard: doc.showPriceOnCard ?? true,
    teaser: doc.teaser || REG_PLATES_TEASER,
    details: doc.details || DEFAULT_DETAILS,
    active: doc.active,
    displayOrder: doc.displayOrder ?? 0,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  }
}

function fallbackRecord(record: RegPlateRecord, index: number): RegPlate {
  return {
    id: record.slug,
    plate: record.plate,
    slug: record.slug,
    price: null,
    showPriceOnCard: true,
    teaser: record.teaser,
    details: DEFAULT_DETAILS,
    active: true,
    displayOrder: index,
  }
}

export function buildRegPlateSlug(plate: string): string {
  return plateToSlug(plate)
}

export function normalizeRegPlateInput(input: RegPlateInput): RegPlateInput {
  const plate = input.plate.trim().toUpperCase()
  const teaser = input.teaser?.trim() || REG_PLATES_TEASER
  const details = input.details?.trim() || DEFAULT_DETAILS
  const slug = (input.slug?.trim() || buildRegPlateSlug(plate)).toLowerCase()
  const active = input.active ?? true
  const price = input.price == null || Number.isNaN(Number(input.price)) ? null : Number(input.price)
  const showPriceOnCard = input.showPriceOnCard ?? true

  const normalized: RegPlateInput = {
    plate,
    slug,
    price,
    showPriceOnCard,
    teaser,
    details,
    active,
  }

  if (input.displayOrder !== undefined && Number.isFinite(Number(input.displayOrder))) {
    normalized.displayOrder = Number(input.displayOrder)
  }

  return normalized
}

export const getRegPlates = cache(async (options?: { includeInactive?: boolean }): Promise<RegPlate[]> => {
  try {
    await connectDB()

    const filter = options?.includeInactive ? {} : { active: true }
    const records = await RegPlateModel.find(filter)
      .sort({ displayOrder: 1, plate: 1 })
      .lean<LeanRegPlate[]>()

    return records.map(serializePlate)
  } catch (err) {
    console.error('[regPlates.service] Failed to fetch from DB:', err)
    return REG_PLATES.map(fallbackRecord)
  }
})

export async function getRegPlateBySlugFromDB(slug: string): Promise<RegPlate | null> {
  try {
    await connectDB()
    const record = await RegPlateModel.findOne({ slug, active: true }).lean<LeanRegPlate | null>()
    return record ? serializePlate(record) : null
  } catch (err) {
    console.error('[regPlates.service] Failed to fetch detail from DB:', err)
    const fallback = REG_PLATES.find((plate) => plate.slug === slug)
    return fallback ? fallbackRecord(fallback, 0) : null
  }
}
