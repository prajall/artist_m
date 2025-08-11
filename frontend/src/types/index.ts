export type UserRole = "user" | "artist" | "artist_manager" | "super_admin";

export interface BaseArtist {
  artist_name: string;
  first_release_year?: number;
  user_id: number;
  manager_id?: number;
}
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  gender?: "male" | "female";
  address?: string;
  dob?: string;
  profile_image?: string;
  created_at: string;

  // artist_name?: string;
  // first_release_year?: number;
  // manager_id?: number;
}

export interface Artist {
  id: number;
  artist_name: string;
  first_release_year?: number;
  manager_id: number;
  user_id: number;
  created_at: string;
}

export interface Song {
  id: number;
  title: string;
  artist_id: number;
  albums?: number[];
  genre?: string;
  song_cover?: File;
  artist_name: string;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: number;
  album_name: string;
  album_cover?: string;
  artist_name: string;
  artist_id: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  address?: string;
  dob?: string;
}

export interface CreateArtistData {
  artist_name: string;
  first_release_year?: number;
  user_id: number;
  manager_id?: number;
}

export interface CreateSongData {
  title: string;
  artist_id: number;
  albums?: string;
  genre?: string;
  song_cover?: File;
}

export interface CreateAlbumData {
  album_name: string;
  artist_id: number;
  album_cover?: File;
}
