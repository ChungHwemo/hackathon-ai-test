import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useParallelSearch } from '@/hooks/useParallelSearch'
import { searchInternal, searchWeb, searchWithAI } from '@/services/knowledge-api'
import type { SearchResponse, SearchResult } from '@/types/knowledge-search'

vi.mock('@/services/knowledge-api', () => ({
  searchInternal: vi.fn(),
  searchWeb: vi.fn(),
  searchWithAI: vi.fn(),
}))

const createDeferred = <T,>() => {
  let resolve: (value: T) => void
  let reject: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}

const createResult = (id: string, source: SearchResult['source']): SearchResult => ({
  id,
  title: `${id} title`,
  source,
  snippet: `${id} snippet`,
  url: '',
  relevance: 90,
})

const createResponse = (results: SearchResult[]): SearchResponse => ({
  results,
  source: results[0]?.source ?? 'confluence',
  total: results.length,
  hasMore: false,
})

describe('useParallelSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute all searches in parallel', async () => {
    const internalDeferred = createDeferred<SearchResponse>()
    const webDeferred = createDeferred<SearchResponse>()
    const aiDeferred = createDeferred<SearchResponse>()

    vi.mocked(searchInternal).mockReturnValueOnce(internalDeferred.promise)
    vi.mocked(searchWeb).mockReturnValueOnce(webDeferred.promise)
    vi.mocked(searchWithAI).mockReturnValueOnce(aiDeferred.promise)

    const { result } = renderHook(() => useParallelSearch())

    let searchPromise: Promise<void> | undefined
    await act(async () => {
      searchPromise = result.current.search('test query')
    })

    expect(searchInternal).toHaveBeenCalledTimes(1)
    expect(searchWeb).toHaveBeenCalledTimes(1)
    expect(searchWithAI).toHaveBeenCalledTimes(1)

    internalDeferred.resolve(createResponse([createResult('int-1', 'confluence')]))
    webDeferred.resolve(createResponse([createResult('web-1', 'google')]))
    aiDeferred.resolve(createResponse([createResult('ai-1', 'gemini')]))

    await act(async () => {
      await searchPromise
    })

    expect(result.current.internalResults).toHaveLength(1)
    expect(result.current.webResults).toHaveLength(1)
    expect(result.current.aiResults).toHaveLength(1)
  })

  it('should track loading state per source', async () => {
    const internalDeferred = createDeferred<SearchResponse>()
    const webDeferred = createDeferred<SearchResponse>()
    const aiDeferred = createDeferred<SearchResponse>()

    vi.mocked(searchInternal).mockReturnValueOnce(internalDeferred.promise)
    vi.mocked(searchWeb).mockReturnValueOnce(webDeferred.promise)
    vi.mocked(searchWithAI).mockReturnValueOnce(aiDeferred.promise)

    const { result } = renderHook(() => useParallelSearch())

    let searchPromise: Promise<void> | undefined
    await act(async () => {
      searchPromise = result.current.search('test query')
    })

    expect(result.current.isLoadingInternal).toBe(true)
    expect(result.current.isLoadingWeb).toBe(true)
    expect(result.current.isLoadingAI).toBe(true)

    await act(async () => {
      internalDeferred.resolve(createResponse([createResult('int-1', 'confluence')]))
      await Promise.resolve()
    })

    expect(result.current.isLoadingInternal).toBe(false)
    expect(result.current.isLoadingWeb).toBe(true)
    expect(result.current.isLoadingAI).toBe(true)

    await act(async () => {
      webDeferred.resolve(createResponse([createResult('web-1', 'google')]))
      aiDeferred.resolve(createResponse([createResult('ai-1', 'gemini')]))
      await Promise.resolve()
    })

    await act(async () => {
      await searchPromise
    })
  })

  it('should handle empty results from all sources', async () => {
    const internalDeferred = createDeferred<SearchResponse>()
    const webDeferred = createDeferred<SearchResponse>()
    const aiDeferred = createDeferred<SearchResponse>()

    vi.mocked(searchInternal).mockReturnValueOnce(internalDeferred.promise)
    vi.mocked(searchWeb).mockReturnValueOnce(webDeferred.promise)
    vi.mocked(searchWithAI).mockReturnValueOnce(aiDeferred.promise)

    const { result } = renderHook(() => useParallelSearch())

    let searchPromise: Promise<void> | undefined
    await act(async () => {
      searchPromise = result.current.search('no results query')
    })

    await act(async () => {
      internalDeferred.resolve(createResponse([]))
      webDeferred.resolve(createResponse([]))
      aiDeferred.resolve(createResponse([]))
      await Promise.resolve()
    })

    await act(async () => {
      await searchPromise
    })

    expect(result.current.internalResults).toHaveLength(0)
    expect(result.current.webResults).toHaveLength(0)
    expect(result.current.aiResults).toHaveLength(0)
    expect(result.current.isLoadingInternal).toBe(false)
    expect(result.current.isLoadingWeb).toBe(false)
    expect(result.current.isLoadingAI).toBe(false)
  })

  it('should handle mixed results (some empty, some with data)', async () => {
    const internalDeferred = createDeferred<SearchResponse>()
    const webDeferred = createDeferred<SearchResponse>()
    const aiDeferred = createDeferred<SearchResponse>()

    vi.mocked(searchInternal).mockReturnValueOnce(internalDeferred.promise)
    vi.mocked(searchWeb).mockReturnValueOnce(webDeferred.promise)
    vi.mocked(searchWithAI).mockReturnValueOnce(aiDeferred.promise)

    const { result } = renderHook(() => useParallelSearch())

    let searchPromise: Promise<void> | undefined
    await act(async () => {
      searchPromise = result.current.search('partial results')
    })

    await act(async () => {
      internalDeferred.resolve(createResponse([createResult('int-1', 'confluence')]))
      webDeferred.resolve(createResponse([]))
      aiDeferred.resolve(createResponse([createResult('ai-1', 'gemini')]))
      await Promise.resolve()
    })

    await act(async () => {
      await searchPromise
    })

    expect(result.current.internalResults).toHaveLength(1)
    expect(result.current.webResults).toHaveLength(0)
    expect(result.current.aiResults).toHaveLength(1)
  })
})
