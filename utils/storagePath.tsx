export function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) return ''

  let cleanPath = photoUrl.replace(/^\/+/, '')

  if (cleanPath.startsWith('toys/') || cleanPath.startsWith('theme/')) {
    return cleanPath
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i
  const startsWithUuid = uuidRegex.test(cleanPath)
  
  if (startsWithUuid) {
    return `toys/${cleanPath}`
  }

  if (!userId) {
    return cleanPath
  }

  if (cleanPath.includes('theme') || cleanPath.includes('Theme')) {
    return `theme/${userId}/${cleanPath}`
  } else {
    return `toys/${userId}/${cleanPath}`
  }
}

export const signedUrlsCache = new Map<string, { url: string; expires: number }>()
export const pendingRequests = new Map<string, Promise<string | null>>()