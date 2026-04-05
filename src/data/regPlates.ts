const REG_PLATE_NAMES = [
  'KEZ 269',
  'J101 KER',
  'V8 FGG',
  'S31 STE',
  'T2 XTS',
  'T25 DME',
  'EDZ 68',
  'S14 BBM',
  'DDZ 74',
  'YU09 NUS',
  'DCZ 786',
  'K3 NWG',
  'S33 FTS',
  'IDZ 61',
  'B16 MWR',
  'IAZ 150',
  'S3 WBP',
  '145 KO',
  'H4 AXH',
  'V4 DDS',
  'X6 LDP',
  'BO05 TLF',
  'J50 RJD',
  'V70 LFC',
  'GEZ 2971',
  '5475 NK',
  'T50 WAR',
  'MEC 5S',
  'IJZ 90',
  'J9 HAV',
  'EKZ 42',
  '4 ASE',
  'X6 RRT',
  'BHZ 45',
  'H9 ABX',
  'LHM 26',
  'VDZ 738',
  'AJZ 47',
  'C48 ASH',
  'S3 OHJ',
  'B22 ASH',
  'B51 NGS',
  'N17 VXR',
  'M44 TRL',
  'IUI 655',
  'W26 BYE',
  'S3 EYE',
  'WDZ 72',
] as const

export const REG_PLATES_TEASER =
  "Should you require any further assistance please click the button, fill out the form and we'll be in touch as soon as possible. Alternatively ..."

export const REG_PLATES_PHONE = '01274 488500'
export const REG_PLATES_MOBILE = '07739 967131'

export const REG_PLATES_LOCATION_LINES = [
  'Rosse Street',
  'Bradford',
  'West Yorkshire',
  'BD8 9AS',
] as const

export const REG_PLATES_OPENING_TIMES = [
  'Viewing by prior arrangement only',
  'Mon - Thur: 10am - 6pm',
  'Friday: 3pm - 6pm',
  'Saturday: 11am - 4pm',
  'Sunday: Closed',
] as const

export type RegPlateRecord = {
  plate: string
  slug: string
  teaser: string
}

function plateToSlug(plate: string): string {
  return plate
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export const REG_PLATES: RegPlateRecord[] = REG_PLATE_NAMES.map((plate) => ({
  plate,
  slug: plateToSlug(plate),
  teaser: REG_PLATES_TEASER,
}))

export function getRegPlateBySlug(slug: string): RegPlateRecord | undefined {
  return REG_PLATES.find((plate) => plate.slug === slug)
}
