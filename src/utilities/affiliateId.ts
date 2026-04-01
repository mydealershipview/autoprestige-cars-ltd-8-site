const parseAffiliateIdsFromEnv = (): string[] => {
  const raw =
    process.env.AUTOTRADER_AFFILIATE_IDS ||
    process.env.AFFILIATE_IDS ||
    process.env.AUTOTRADER_ADVERTISER_ID ||
    process.env.NEXT_PUBLIC_DEALER_AFFILIATE_ID ||
    ''

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

/**
 * Get the active dealer affiliate ID from the database
 * Falls back to environment variable if no active ID is found
 */
export async function getActiveAffiliateId(): Promise<string> {
  const ids = parseAffiliateIdsFromEnv()
  return ids[0] || '43697'
}

/**
 * Get all affiliate IDs from the database
 */
export async function getAllAffiliateIds(): Promise<Array<{ id: string; dealerAffiliateId: string; isActive: boolean; description?: string }>> {
  const ids = parseAffiliateIdsFromEnv()

  return ids.map((dealerAffiliateId, index) => ({
    id: `env-${index + 1}`,
    dealerAffiliateId,
    isActive: index === 0,
    description: 'Loaded from environment variable',
  }))
}
