import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import connectDB from '@/lib/db/connect'
// The live site (no seo.ts on this template)
const canonicalOrigin = 'https://autoprestigecars.co.uk'
const schema = new mongoose.Schema({
  _id: String, count: { type: Number, required: true }, expiresAt: { type: Date, required: true },
})
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const Limits = mongoose.models.WebsiteLeadLimit || mongoose.model('WebsiteLeadLimit', schema)

/**
 * Hosts a browser may post a lead from: the host the visitor actually used (the proxy forwards it
 * in x-forwarded-host / host), plus the live domain with and without www. request.url can't be
 * used alone: when self-hosted it carries the server's internal address (e.g. localhost:3000).
 */
function allowedHosts(request: NextRequest) {
  const hosts = new Set<string>()
  const add = (value?: string | null) => {
    const host = value?.split(',')[0].trim().toLowerCase()
    if (host) hosts.add(host)
  }
  add(request.headers.get('x-forwarded-host'))
  add(request.headers.get('host'))
  add(new URL(request.url).host)
  const live = new URL(canonicalOrigin).host
  hosts.add(live)
  hosts.add(`www.${live}`)
  return hosts
}

function isAllowedOrigin(request: NextRequest, origin: string) {
  try {
    return allowedHosts(request).has(new URL(origin).host.toLowerCase())
  } catch {
    return false
  }
}

/**
 * Spam checks for lead forms (same as MWA's, 29/10/2026): a filled hidden "website" field, a post from
 * another site, or more than 10 submissions from one IP in 10 minutes. A real enquiry is never lost to
 * the limit itself: with no visitor IP, or if the limit store is unavailable, the lead goes through
 * (the store failure is logged).
 */
export async function guardLead(request: NextRequest, body: { website?: unknown }) {
  if (body.website) return NextResponse.json({ error: 'Unable to accept this submission' }, { status: 400 })
  const origin = request.headers.get('origin')
  if (origin && !isAllowedOrigin(request, origin)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip')
  if (!ip) return null
  const bucket = Math.floor(Date.now() / 600_000)
  const id = createHash('sha256').update(`${ip}:${bucket}`).digest('hex')
  try {
    await connectDB()
    const limit = await Limits.findOneAndUpdate({ _id: id }, {
      $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 600_000) },
    }, { upsert: true, new: true })
    if (limit.count > 10) return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429, headers: { 'Retry-After': '600' } })
  } catch (error) {
    console.error('[lead-spam-guard] submission limit unavailable; lead accepted without it', error)
  }
  return null
}
