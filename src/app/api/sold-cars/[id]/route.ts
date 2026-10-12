import { NextResponse } from 'next/server'

// Legacy website sold-ad management is retired. No writes to the old archive.
const retired = () => NextResponse.json({ error: 'Manage sold cars in MyDealershipView' }, { status: 410 })
export const PATCH = retired
