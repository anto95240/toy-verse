import { useState, useEffect, useCallback, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/type'
import type { Toy } from "@/types/theme"
import { buildStoragePath, signedUrlsCache, pendingRequests } from "@/utils/storagePath"

export function useSignedUrl(
  toy: Toy, 
  toyImageUrls: Record<string, string | null>, 
  currentUserId?: string
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const supabase = useMemo(() => createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const generateSignedUrl = useCallback(async (toy: Toy): Promise<string | null> => {
    const cacheKey = `${toy.id}-${toy.photo_url}-${currentUserId}`

    const cached = signedUrlsCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return cached.url
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!
    }

    if (!toy.photo_url) {
      return null
    }

    if (toy.photo_url.startsWith('http')) {
      return toy.photo_url
    }

    const storagePath = buildStoragePath(toy.photo_url, currentUserId)

    const promise = (async () => {
      try {
        const { data, error } = await supabase.storage
          .from('toys-images')
          .createSignedUrl(storagePath, 7200)

        if (error) {
          return null
        }

        if (data?.signedUrl) {
          signedUrlsCache.set(cacheKey, {
            url: data.signedUrl,
            expires: Date.now() + 7200 * 1000 - 60 * 1000,
          })
          return data.signedUrl
        }
        
        return null
      } catch (err) {
        return null
      } finally {
        pendingRequests.delete(cacheKey)
      }
    })()

    pendingRequests.set(cacheKey, promise)
    return await promise
  }, [supabase, currentUserId])

  useEffect(() => {
    let isMounted = true

    const loadImage = async () => {
      setHasError(false)
      setIsLoading(true)

      try {
        if (toyImageUrls[toy.id]) {
          if (isMounted) {
            setImageUrl(toyImageUrls[toy.id])
            setIsLoading(false)
          }
          return
        }

        const signedUrl = await generateSignedUrl(toy)
        
        if (isMounted) {
          setImageUrl(signedUrl)
          setIsLoading(false)
          if (!signedUrl) {
            setHasError(true)
          }
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [toy.id, toy.photo_url, toyImageUrls, generateSignedUrl, currentUserId])

  return { imageUrl, isLoading, hasError }
}