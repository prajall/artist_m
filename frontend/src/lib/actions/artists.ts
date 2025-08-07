'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import { Artist, CreateArtistData, PaginatedResponse } from '@/types'

export async function getArtists(page = 1, limit = 10): Promise<PaginatedResponse<Artist>> {
  const offset = (page - 1) * limit
  const response = await apiRequest(`/artist?limit=${limit}&offset=${offset}`)
  
  return {
    data: response.artists,
    total: response.total_artists,
    page,
    limit
  }
}

export async function getArtistById(id: number): Promise<Artist> {
  return apiRequest(`/artist/${id}`)
}

export async function createArtist(data: CreateArtistData): Promise<Artist> {
  const result = await apiRequest('/artist', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/artists')
  return result
}

export async function updateArtist(id: number, data: Partial<CreateArtistData>): Promise<Artist> {
  const result = await apiRequest(`/artist/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/artists')
  revalidatePath(`/admin/artists/${id}`)
  return result
}

export async function deleteArtist(id: number): Promise<void> {
  await apiRequest(`/artist/${id}`, {
    method: 'DELETE'
  })
  
  revalidatePath('/admin/artists')
}
