"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Song, CreateSongData, PaginatedResponse } from "@/types";
import { apiRequest } from "../api";

const fetchSongs = async (
  page: number,
  limit: number,
  artistId?: number,
  managerId?: number
): Promise<PaginatedResponse<Song>> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });

  if (artistId) params.append("artist_id", artistId.toString());
  if (managerId) params.append("manager_id", managerId.toString());

  const response = await apiRequest.get(`/song/?${params.toString()}`);
  console.log("Songs response:", response.data);
  const data = response.data?.data;

  return {
    data: data.songs,
    total: data.total_songs,
    page,
    limit,
  };
};

const fetchSongById = async (id: number): Promise<Song> => {
  const response = await apiRequest.get(`/song/${id}/`);
  return response.data;
};

const createSong = async (songData: CreateSongData): Promise<Song> => {
  try {
    const formData = new FormData();
    Object.entries(songData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    const response = await apiRequest.post(`/song/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateSong = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateSongData>;
}): Promise<Song> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });

  const response = await apiRequest.patch(`/song/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const deleteSong = async (id: number) => {
  const response = await apiRequest.delete(`/song/${id}/`);
  return response.data;
};

export const useSongs = (artistId?: number, managerId?: number) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  const { data, error, isPending } = useQuery<PaginatedResponse<Song>>({
    queryKey: ["songs", page, limit, artistId, managerId],
    queryFn: () => fetchSongs(page, limit, artistId, managerId),
    staleTime: 10 * 1000,
  });

  const getSongById = (id: number) => {
    return useQuery<Song>({
      queryKey: ["song", id],
      queryFn: () => fetchSongById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

  const createSongMutation = useMutation({
    mutationKey: ["songs"],
    mutationFn: createSong,
    onMutate: async () => {
      toast.loading("Creating song...", { id: "song-create" });
    },
    onSuccess: () => {
      toast.success("Song created successfully", { id: "song-create" });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
    onError: (err: any) => {
      console.error("Error creating song:", err);
      if (err.response) {
        toast.error(err.response.data.message, { id: "song-create" });
      } else {
        toast.error("Failed to create song", { id: "song-create" });
      }
    },
  });

  const updateSongMutation = useMutation({
    mutationKey: ["songs"],
    mutationFn: updateSong,
    onMutate: async () => {
      toast.loading("Updating song...", { id: "song-update" });
    },
    onSuccess: () => {
      toast.success("Song updated successfully", { id: "song-update" });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["song"] });
    },
    onError: (err) => {
      console.error("Error updating song:", err);
      toast.error("Failed to update song", { id: "song-update" });
    },
  });

  const deleteSongMutation = useMutation({
    mutationKey: ["songs"],
    mutationFn: deleteSong,
    onMutate: async () => {
      toast.loading("Deleting song...", { id: "song-delete" });
    },
    onSuccess: () => {
      toast.success("Song deleted successfully", { id: "song-delete" });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
    onError: (err) => {
      console.error("Error deleting song:", err);
      toast.error("Failed to delete song", { id: "song-delete" });
    },
  });

  return {
    songs: data?.data || [],
    totalSongs: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    isLoading: isPending,
    isCreating: createSongMutation.isPending,
    isUpdating: updateSongMutation.isPending,
    isDeleting: deleteSongMutation.isPending,

    error,

    createSong: createSongMutation.mutateAsync,
    updateSong: updateSongMutation.mutateAsync,
    deleteSong: deleteSongMutation.mutateAsync,
    getSongById,

    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
