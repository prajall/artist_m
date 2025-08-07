'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import { Album, CreateAlbumData, PaginatedResponse } from '@/types'

export async function getAlbums(page = 1, limit = 10, artistId?: number): Promise<PaginatedResponse<Album>> {
  const offset = (page - 1) * limit
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  })
  
  if (artistId) params.append('artist_id', artistId.toString())
  
  const response = await apiRequest(`/album?${params.toString()}`)
  
  return {
    data: response.albums,
    total: response.total_albums,
    page,
    limit
  }
}

export async function getAlbumById(id: number): Promise<Album> {
  return apiRequest(`/album/${id}`)
}

export async function createAlbum(data: CreateAlbumData): Promise<Album> {
  const result = await apiRequest('/album', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/albums')
  return result
}

export async function updateAlbum(id: number, data: Partial<CreateAlbumData>): Promise<Album> {
  const result = await apiRequest(`/album/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/albums')
  revalidatePath(`/admin/albums/${id}`)
  return result
}

export async function deleteAlbum(id: number): Promise<void> {
  await apiRequest(`/album/${id}`, {
    method: 'DELETE'
  })
  
  revalidatePath('/admin/albums')
}
