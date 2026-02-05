import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'
import { searchInternal, searchWeb, searchWithAI } from '@/services/knowledge-api'
import { searchTeamsMessages } from '@/services/teams-api'
import type { SearchResult } from '@/types/knowledge-search'

interface ParallelSearchState {
  internalResults: SearchResult[]
  webResults: SearchResult[]
  aiResults: SearchResult[]
  teamsResults: SearchResult[]
  isLoadingInternal: boolean
  isLoadingWeb: boolean
  isLoadingAI: boolean
  isLoadingTeams: boolean
  error: string | null
}

const initialState: ParallelSearchState = {
  internalResults: [],
  webResults: [],
  aiResults: [],
  teamsResults: [],
  isLoadingInternal: false,
  isLoadingWeb: false,
  isLoadingAI: false,
  isLoadingTeams: false,
  error: null,
}

const createLoadingState = (): ParallelSearchState => ({
  ...initialState,
  isLoadingInternal: true,
  isLoadingWeb: true,
  isLoadingAI: true,
  isLoadingTeams: true,
})

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

const resolveInternal = (setState: Dispatch<SetStateAction<ParallelSearchState>>, results: SearchResult[]) => {
  setState(prev => ({ ...prev, internalResults: results, isLoadingInternal: false }))
}

const resolveWeb = (setState: Dispatch<SetStateAction<ParallelSearchState>>, results: SearchResult[]) => {
  setState(prev => ({ ...prev, webResults: results, isLoadingWeb: false }))
}

const resolveAI = (setState: Dispatch<SetStateAction<ParallelSearchState>>, results: SearchResult[]) => {
  setState(prev => ({ ...prev, aiResults: results, isLoadingAI: false }))
}

const rejectInternal = (setState: Dispatch<SetStateAction<ParallelSearchState>>, error: unknown) => {
  setState(prev => ({ ...prev, isLoadingInternal: false, error: getErrorMessage(error, 'Internal search failed') }))
}

const rejectWeb = (setState: Dispatch<SetStateAction<ParallelSearchState>>, error: unknown) => {
  setState(prev => ({ ...prev, isLoadingWeb: false, error: getErrorMessage(error, 'Web search failed') }))
}

const rejectAI = (setState: Dispatch<SetStateAction<ParallelSearchState>>, error: unknown) => {
  setState(prev => ({ ...prev, isLoadingAI: false, error: getErrorMessage(error, 'AI search failed') }))
}

const resolveTeams = (setState: Dispatch<SetStateAction<ParallelSearchState>>, results: SearchResult[]) => {
  setState(prev => ({ ...prev, teamsResults: results, isLoadingTeams: false }))
}

const rejectTeams = (setState: Dispatch<SetStateAction<ParallelSearchState>>, error: unknown) => {
  setState(prev => ({ ...prev, isLoadingTeams: false, error: getErrorMessage(error, 'Teams search failed') }))
}

const runInternal = (query: string, setState: Dispatch<SetStateAction<ParallelSearchState>>) =>
  searchInternal(query).then(res => resolveInternal(setState, res.results)).catch(error => rejectInternal(setState, error))

const runWeb = (query: string, setState: Dispatch<SetStateAction<ParallelSearchState>>) =>
  searchWeb(query).then(res => resolveWeb(setState, res.results)).catch(error => rejectWeb(setState, error))

const runAI = (query: string, setState: Dispatch<SetStateAction<ParallelSearchState>>) =>
  searchWithAI(query, []).then(res => resolveAI(setState, res.results)).catch(error => rejectAI(setState, error))

const runTeams = (query: string, setState: Dispatch<SetStateAction<ParallelSearchState>>) =>
  searchTeamsMessages(query).then(res => resolveTeams(setState, res.results)).catch(error => rejectTeams(setState, error))

const executeParallelSearch = async (query: string, setState: Dispatch<SetStateAction<ParallelSearchState>>) => {
  await Promise.allSettled([
    runInternal(query, setState),
    runWeb(query, setState),
    runAI(query, setState),
    runTeams(query, setState),
  ])
}

export function useParallelSearch() {
  const [state, setState] = useState<ParallelSearchState>(initialState)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return
    setState(createLoadingState())
    await executeParallelSearch(query, setState)
  }, [])

  return { ...state, search }
}
