// ─────────────────────────────────────────────────────────────
// SUPABASE STORAGE — Image upload functionality
// ─────────────────────────────────────────────────────────────

import { supabase } from './supabase'

const STORAGE_BUCKET = 'sbo-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  url: string
  error?: string
}

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param folder Optional folder path within the bucket (e.g., 'officers', 'news')
 * @returns Promise with the public URL or error
 */
export async function uploadImage(file: File, folder: string = 'general'): Promise<UploadResult> {
  // Validate file
  if (!file) {
    return { url: '', error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { url: '', error: 'File size exceeds 5MB limit' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: '', error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' }
  }

  if (!supabase) {
    return { url: '', error: 'Supabase is not configured' }
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[uploadImage] Upload failed:', uploadError)
      return { url: '', error: uploadError.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl }
  } catch (error) {
    console.error('[uploadImage] Unexpected error:', error)
    return { url: '', error: 'Upload failed due to an unexpected error' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url The public URL of the image to delete
 * @returns Promise with success status
 */
export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }

  try {
    // Extract path from URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET)
    
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid URL format' }
    }

    const path = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path])

    if (error) {
      console.error('[deleteImage] Delete failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[deleteImage] Unexpected error:', error)
    return { success: false, error: 'Delete failed due to an unexpected error' }
  }
}

/**
 * Check if the storage bucket exists and is accessible
 */
export async function checkStorageBucket(): Promise<boolean> {
  if (!supabase) return false

  try {
    const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET)
    return !error && !!data
  } catch {
    return false
  }
}
