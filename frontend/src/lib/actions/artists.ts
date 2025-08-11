"use server";

import { Artist, CreateArtistData } from "@/types";
import { apiRequest } from "../api";

export const createArtist = async (
  artistData: CreateArtistData
): Promise<Artist> => {
  const response = await apiRequest.post(`/artist/`, artistData);

  return response.data;
};

export const updateArtist = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateArtistData>;
}): Promise<Artist> => {
  delete data.user_id;
  const response = await apiRequest.patch(`/artist/${id}/`, data);
  return response.data;
};

export const deleteArtist = async (id: number): Promise<void> => {
  return await apiRequest.delete(`/artist/${id}/`);
};
