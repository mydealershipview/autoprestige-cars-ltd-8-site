import { parse } from 'dotenv'
import mongoose from 'mongoose'
import { readFile, writeFile, appendFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { S3Client } from '@aws-sdk/client-s3'
import { sourceUrl, copyArchiveImage } from './lib/archive-image-copy.mjs'

const apply = process.argv.includes('--apply')
const resize = process.argv.find(arg => arg.startsWith('--resize='))?.split('=')[1] ?? null
if (resize && !['w1920', 'w1024h768', 'w800'].includes(resize)) throw new Error('Unsupported AutoTrader image size')
const concurrency = Number(process.argv.find(arg => arg.startsWith('--concurrency='))?.split('=')[1] ?? 12)
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) throw new Error('Concurrency must be 1 to 32')
const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] ?? Infinity)
if (!(limit > 0)) throw new Error('Invalid limit')
const websiteEnv = parse(await readFile('.env'))
const storageEnv = parse(await readFile(process.env.DMS_STORAGE_ENV || '../MYDV-DMS/.env'))
for (const key of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_URL_ARTICLE_IMAGES']) {
  if (!storageEnv[key]) throw new Error(`Missing storage configuration: ${key}`)
}
if (new URL(storageEnv.R2_PUBLIC_URL_ARTICLE_IMAGES).protocol !== 'https:') throw new Error('Public storage must use HTTPS')
let client
try {
  await mongoose.connect(websiteEnv.DATABASE_URI, { autoIndex: false, autoCreate: false })
  const collection = mongoose.connection.collection('sold_cars')
  const rows = await collection.find({}, { projection: { stockId: 1, showOnSoldPage: 1, 'vehicle.media.images': 1 } }).toArray()
  // Protect currently selected adverts first, then every other archived car.
  rows.sort((a, b) => Number(b.showOnSoldPage === true) - Number(a.showOnSoldPage === true))
  const urls = [...new Set(rows.flatMap(row => (row.vehicle?.media?.images ?? []).flatMap(image =>
    [image.href, image.url].filter(value => sourceUrl(value)))))].slice(0, limit)
  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', cars: rows.length, uniqueImagesToCopy: urls.length }))
  } else {
    const run = join(tmpdir(), `autoprestige-images-${Date.now()}`)
    const backupPath = `${run}-backup.json`
    const reportPath = `${run}-report.jsonl`
    await writeFile(backupPath, JSON.stringify(rows.map(row => ({ id: String(row._id), stockId: row.stockId, images: row.vehicle?.media?.images ?? [] }))), { mode: 0o600, flag: 'wx' })
    await writeFile(reportPath, '', { mode: 0o600, flag: 'wx' })
    client = new S3Client({ region: 'auto', endpoint: `https://${storageEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: storageEnv.R2_ACCESS_KEY_ID, secretAccessKey: storageEnv.R2_SECRET_ACCESS_KEY }, maxAttempts: 4 })
    const copied = new Map()
    let next = 0, complete = 0, failed = 0, totalBytes = 0
    console.log(JSON.stringify({ phase: 'start', images: urls.length, backupPath, reportPath }))
    async function worker() {
      for (;;) {
        const index = next++
        if (index >= urls.length) return
        const source = urls[index]
        try {
          let result
          for (let attempt = 0; attempt < 3; attempt++) {
            try { result = await copyArchiveImage({ url: source, client, bucket: 'article-images', publicBase: storageEnv.R2_PUBLIC_URL_ARTICLE_IMAGES, resize }); break }
            catch (error) {
              if (attempt === 2 || /HTTP (404|410)|placeholder|Unsupported|Invalid image/.test(error.message)) throw error
              await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt))
            }
          }
          copied.set(source, result.target)
          totalBytes += result.bytes
          await appendFile(reportPath, JSON.stringify({ ok: true, ...result }) + '\n')
        } catch (error) {
          failed++
          await appendFile(reportPath, JSON.stringify({ ok: false, source, error: String(error.message).slice(0,250) }) + '\n')
        }
        complete++
        if (complete % 100 === 0 || complete === urls.length)
          console.log(JSON.stringify({ phase: 'copy', complete, total: urls.length, copied: copied.size, failed, bytes: totalBytes }))
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker))
    const changes = rows.flatMap(row => {
      const before = row.vehicle?.media?.images ?? []
      let changed = false
      const after = before.map(image => {
        const value = { ...image }
        for (const field of ['href', 'url']) if (copied.has(image[field])) { value[field] = copied.get(image[field]); changed = true }
        return value
      })
      return changed ? [{ row, before, after }] : []
    })
    if (changes.length) {
      const result = await collection.bulkWrite(changes.map(({ row, before, after }) => ({ updateOne: {
        // Compare-and-swap protects changes another operator may have made during the long copy.
        filter: { _id: row._id, stockId: row.stockId, 'vehicle.media.images': before },
        update: { $set: { 'vehicle.media.images': after } },
      } })), { ordered: true })
      if (result.matchedCount !== changes.length) throw new Error(`Concurrent image changes detected. Matched ${result.matchedCount}/${changes.length}; see ${backupPath}`)
    }
    const saved = await collection.find({}, { projection: { stockId: 1, showOnSoldPage: 1, 'vehicle.media.images': 1 } }).toArray()
    const remaining = saved.flatMap(row => (row.vehicle?.media?.images ?? []).flatMap(image =>
      [image.href, image.url].filter(value => sourceUrl(value)).map(source => ({ source, selected: row.showOnSoldPage === true }))))
    console.log(JSON.stringify({ phase: 'done', copied: copied.size, failed, carsUpdated: changes.length, totalBytes,
      remainingExternalReferences: remaining.length, remainingSelectedReferences: remaining.filter(row => row.selected).length, backupPath, reportPath }))
    if (failed || remaining.length) process.exitCode = 2
  }
} finally { client?.destroy(); await mongoose.disconnect() }
