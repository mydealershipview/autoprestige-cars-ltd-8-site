import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import connectDB from '@/lib/db/connect'
const schema = new mongoose.Schema({
  _id: String, count: { type: Number, required: true }, expiresAt: { type: Date, required: true },
})
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const Limits = mongoose.models.WebsiteLeadLimit || mongoose.model('WebsiteLeadLimit', schema)

/** Atomic, shared across replicas. TTL is cleanup only; the bucket ID defines expiry. */
export async function guardLead(request: NextRequest, body: { website?: unknown }) {
  if (body.website) return NextResponse.json({ error: 'Unable to accept this submission' }, { status: 400 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  const bucket = Math.floor(Date.now() / 600_000)
  const id = createHash('sha256').update(`${ip}:${bucket}`).digest('hex')
  await connectDB()
  const limit = await Limits.findOneAndUpdate({ _id: id }, {
    $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 600_000) },
  }, { upsert: true, new: true })
  if (limit.count > 10) return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429, headers: { 'Retry-After': '600' } })
  return null
}
