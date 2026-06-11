import { redirect } from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

const toQueryString = (searchParams: SearchParams) => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
      continue
    }

    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export default async function ShowroomRedirectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolved = await searchParams
  redirect(`/usedcars${toQueryString(resolved)}`)
}
