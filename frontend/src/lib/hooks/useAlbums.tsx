"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Album, CreateAlbumData, PaginatedResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// API functions
const fetchAlbums = async (
  page: number,
  limit: number,
  artistId?: number
): Promise<PaginatedResponse<Album>> => {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (artistId) params.append("artist_id", artistId.toString());

  const response = await fetch(`${API_BASE_URL}/album?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch albums");
  }

  const data = await response.json();
  return {
    data: data.albums,
    total: data.total_albums,
    page,
    limit,
  };
};

const fetchAlbumById = async (id: number): Promise<Album> => {
  const response = await fetch(`${API_BASE_URL}/album/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch album");
  }

  return response.json();
};

const createAlbum = async (albumData: CreateAlbumData): Promise<Album> => {
  const response = await fetch(`${API_BASE_URL}/album`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(albumData),
  });

  if (!response.ok) {
    throw new Error("Failed to create album");
  }

  return response.json();
};

const updateAlbum = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateAlbumData>;
}): Promise<Album> => {
  const response = await fetch(`${API_BASE_URL}/album/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update album");
  }

  return response.json();
};

const deleteAlbum = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/album/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete album");
  }
};

export const useAlbums = (artistId?: number) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  // Fetch albums list
  const { data, error, isFetching, isPending } = useQuery<
    PaginatedResponse<Album>
  >({
    queryKey: ["albums", page, limit, artistId],
    queryFn: () => fetchAlbums(page, limit, artistId),
    staleTime: 10 * 1000,
  });

  // Fetch single album
  const getAlbumById = (id: number) => {
    return useQuery<Album>({
      queryKey: ["album", id],
      queryFn: () => fetchAlbumById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

  // Create album mutation
  const createAlbumMutation = useMutation({
    mutationKey: ["albums"],
    mutationFn: createAlbum,
    onMutate: async () => {
      toast.loading("Creating album...", { id: "album-create" });
    },
    onSuccess: () => {
      toast.success("Album created successfully", { id: "album-create" });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err) => {
      console.error("Error creating album:", err);
      toast.error("Failed to create album", { id: "album-create" });
    },
  });

  // Update album mutation
  const updateAlbumMutation = useMutation({
    mutationKey: ["albums"],
    mutationFn: updateAlbum,
    onMutate: async () => {
      toast.loading("Updating album...", { id: "album-update" });
    },
    onSuccess: () => {
      toast.success("Album updated successfully", { id: "album-update" });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album"] });
    },
    onError: (err) => {
      console.error("Error updating album:", err);
      toast.error("Failed to update album", { id: "album-update" });
    },
  });

  // Delete album mutation
  const deleteAlbumMutation = useMutation({
    mutationKey: ["albums"],
    mutationFn: deleteAlbum,
    onMutate: async () => {
      toast.loading("Deleting album...", { id: "album-delete" });
    },
    onSuccess: () => {
      toast.success("Album deleted successfully", { id: "album-delete" });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err) => {
      console.error("Error deleting album:", err);
      toast.error("Failed to delete album", { id: "album-delete" });
    },
  });

  return {
    // Data
    albums: data?.data || [],
    totalAlbums: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    // Loading states
    isLoading: isPending,
    isFetching,
    isCreating: createAlbumMutation.isPending,
    isUpdating: updateAlbumMutation.isPending,
    isDeleting: deleteAlbumMutation.isPending,

    // Error
    error,

    // Actions
    createAlbum: createAlbumMutation.mutate,
    updateAlbum: updateAlbumMutation.mutate,
    deleteAlbum: deleteAlbumMutation.mutate,
    getAlbumById,

    // Metadata
    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
