'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import { User, CreateUserData, PaginatedResponse } from '@/types'

export async function getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
  const offset = (page - 1) * limit
  const response = await apiRequest(`/user?limit=${limit}&offset=${offset}`)
  
  return {
    data: response.users,
    total: response.total_users,
    page,
    limit
  }
}

export async function getUserById(id: number): Promise<User> {
  return apiRequest(`/user/${id}`)
}

export async function createUser(data: CreateUserData): Promise<User> {
  const result = await apiRequest('/user', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/users')
  return result
}

export async function updateUser(id: number, data: Partial<CreateUserData>): Promise<User> {
  const result = await apiRequest(`/user/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return result
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest(`/user/${id}`, {
    method: 'DELETE'
  })
  
  revalidatePath('/admin/users')
}
