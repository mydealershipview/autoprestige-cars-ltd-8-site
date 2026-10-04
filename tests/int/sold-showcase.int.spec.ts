import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSoldVehicles } from '@/hooks/useSoldVehicles'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('sold showcase loading', () => {
  it('shows an error instead of an empty archive on API failure and supports retry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ metadata: { stockId: 'sold-1' } }] })))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useSoldVehicles('/api/sold-listings'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.error).toContain('Could not load'))
    expect(result.current.loading).toBe(false)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.vehicles[0]?.metadata.stockId).toBe('sold-1'))
    expect(result.current.error).toBeNull()
  })

  it('ignores obsolete responses when the request changes', async () => {
    let resolveFirst!: (response: Response) => void
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ metadata: { stockId: 'new' } }] })))
    vi.stubGlobal('fetch', fetchMock)
    const { result, rerender } = renderHook(({ url }) => useSoldVehicles(url), {
      initialProps: { url: '/api/sold-listings?pageSize=12' },
    })
    rerender({ url: '/api/sold-listings?pageSize=20' })
    await waitFor(() => expect(result.current.vehicles[0]?.metadata.stockId).toBe('new'))
    await act(async () => {
      resolveFirst(new Response(JSON.stringify({ results: [{ metadata: { stockId: 'old' } }] })))
    })
    expect(result.current.vehicles[0]?.metadata.stockId).toBe('new')
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
  })

  it('distinguishes a successful empty archive from a failed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] }))))
    const { result } = renderHook(() => useSoldVehicles('/api/sold-listings'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.vehicles).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
