'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import { Song, CreateSongData, PaginatedResponse } from '@/types'

export async function getSongs(page = 1, limit = 10, artistId?: number, managerId?: number): Promise<PaginatedResponse<Song>> {
  const offset = (page - 1) * limit
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  })
  
  if (artistId) params.append('artist_id', artistId.toString())
  if (managerId) params.append('manager_id', managerId.toString())
  
  const response = await apiRequest(`/song?${params.toString()}`)
  
  return {
    data: response.songs,
    total: response.total_songs,
    page,
    limit
  }
}

export async function getSongById(id: number): Promise<Song> {
  return apiRequest(`/song/${id}`)
}

export async function createSong(data: CreateSongData): Promise<Song> {
  const result = await apiRequest('/song', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/songs')
  return result
}

export async function updateSong(id: number, data: Partial<CreateSongData>): Promise<Song> {
  const result = await apiRequest(`/song/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/songs')
  revalidatePath(`/admin/songs/${id}`)
  return result
}

export async function deleteSong(id: number): Promise<void> {
  await apiRequest(`/song/${id}`, {
    method: 'DELETE'
  })
  
  revalidatePath('/admin/songs')
}
