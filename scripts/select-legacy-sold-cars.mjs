import 'dotenv/config'
import mongoose from 'mongoose'
import { readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const apply = process.argv.includes('--apply')
const selection = JSON.parse(await readFile(new URL('../data/legacy-sold-selection.json', import.meta.url), 'utf8'))
const normalize = value => String(value ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase()
if (!Array.isArray(selection) || !selection.length || new Set(selection.map(row => row.stockId)).size !== selection.length)
  throw new Error('Selection must contain unique stock IDs')

try {
  await mongoose.connect(process.env.DATABASE_URI, { autoIndex: false, autoCreate: false })
  const collection = mongoose.connection.collection('sold_cars')
  const rows = await collection.find({}, { projection: { stockId: 1, registration: 1, 'vehicle.vehicle.registration': 1, showOnSoldPage: 1 } }).toArray()
  const selectedIds = new Set()
  for (const requested of selection) {
    const matches = rows.filter(row => row.stockId === requested.stockId &&
      [row.registration, row.vehicle?.vehicle?.registration].some(reg => normalize(reg) === requested.registration))
    if (matches.length !== 1) throw new Error(`Expected one exact stock ID/registration match for ${requested.stockId}, found ${matches.length}`)
    selectedIds.add(String(matches[0]._id))
  }
  const summary = { mode: apply ? 'apply' : 'dry-run', archiveRecords: rows.length, selectedRecords: selectedIds.size,
    uniqueRegistrations: new Set(selection.map(row => row.registration)).size,
    currentlyEnabled: rows.filter(row => row.showOnSoldPage === true).length }
  if (!apply) {
    console.log(JSON.stringify(summary))
  } else {
    // Backup flags only, never vehicle/customer data or credentials. Restore absent fields with $unset.
    const backupPath = join(tmpdir(), `autoprestige-sold-flags-${Date.now()}.json`)
    await writeFile(backupPath, JSON.stringify(rows.map(row => ({ id: String(row._id), stockId: row.stockId,
      hadFlag: Object.hasOwn(row, 'showOnSoldPage'), value: row.showOnSoldPage })), null, 2) + '\n', { mode: 0o600, flag: 'wx' })
    const result = await collection.bulkWrite(rows.map(row => ({ updateOne: {
      filter: { _id: row._id, stockId: row.stockId },
      update: { $set: { showOnSoldPage: selectedIds.has(String(row._id)) } },
    } })), { ordered: true })
    const enabled = await collection.find({ showOnSoldPage: true }, { projection: { _id: 1 } }).toArray()
    if (result.matchedCount !== rows.length || enabled.length !== selectedIds.size || enabled.some(row => !selectedIds.has(String(row._id))))
      throw new Error(`Flag verification failed; backup: ${backupPath}`)
    console.log(JSON.stringify({ ...summary, matched: result.matchedCount, modified: result.modifiedCount,
      enabledAfter: enabled.length, backupPath }))
  }
} finally {
  await mongoose.disconnect()
}
