"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Song, CreateSongData, PaginatedResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// API functions
const fetchSongs = async (
  page: number,
  limit: number,
  artistId?: number,
  managerId?: number
): Promise<PaginatedResponse<Song>> => {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (artistId) params.append("artist_id", artistId.toString());
  if (managerId) params.append("manager_id", managerId.toString());

  const response = await fetch(`${API_BASE_URL}/song?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch songs");
  }

  const data = await response.json();
  return {
    data: data.songs,
    total: data.total_songs,
    page,
    limit,
  };
};

const fetchSongById = async (id: number): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/song/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch song");
  }

  return response.json();
};

const createSong = async (songData: CreateSongData): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/song`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(songData),
  });

  if (!response.ok) {
    throw new Error("Failed to create song");
  }

  return response.json();
};

const updateSong = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateSongData>;
}): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/song/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update song");
  }

  return response.json();
};

const deleteSong = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/song/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete song");
  }
};

export const useSongs = (artistId?: number, managerId?: number) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  // Fetch songs list
  const { data, error, isFetching, isPending } = useQuery<
    PaginatedResponse<Song>
  >({
    queryKey: ["songs", page, limit, artistId, managerId],
    queryFn: () => fetchSongs(page, limit, artistId, managerId),
    staleTime: 10 * 1000,
  });

  // Fetch single song
  const getSongById = (id: number) => {
    return useQuery<Song>({
      queryKey: ["song", id],
      queryFn: () => fetchSongById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

  // Create song mutation
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
    onError: (err) => {
      console.error("Error creating song:", err);
      toast.error("Failed to create song", { id: "song-create" });
    },
  });

  // Update song mutation
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

  // Delete song mutation
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
    // Data
    songs: data?.data || [],
    totalSongs: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    // Loading states
    isLoading: isPending,
    isFetching,
    isCreating: createSongMutation.isPending,
    isUpdating: updateSongMutation.isPending,
    isDeleting: deleteSongMutation.isPending,

    // Error
    error,

    // Actions
    createSong: createSongMutation.mutate,
    updateSong: updateSongMutation.mutate,
    deleteSong: deleteSongMutation.mutate,
    getSongById,

    // Metadata
    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
