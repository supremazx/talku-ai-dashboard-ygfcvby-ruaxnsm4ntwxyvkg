import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { 
    headers: { 
      'Content-Type': 'application/json',
      ...((init?.headers as Record<string, string>) || {})
    }, 
    ...init 
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    console.error(`[API ERROR] Path: ${path}`, json.error || 'Unknown error')
    throw new Error(json.error || 'Request failed')
  }
  return json.data
}