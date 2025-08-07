"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Artist, CreateArtistData, PaginatedResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// API functions
const fetchArtists = async (
  page: number,
  limit: number
): Promise<PaginatedResponse<Artist>> => {
  const offset = (page - 1) * limit;
  const response = await fetch(
    `${API_BASE_URL}/artist?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch artists");
  }

  const data = await response.json();
  return {
    data: data.artists,
    total: data.total_artists,
    page,
    limit,
  };
};

const fetchArtistById = async (id: number): Promise<Artist> => {
  const response = await fetch(`${API_BASE_URL}/artist/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch artist");
  }

  return response.json();
};

const createArtist = async (artistData: CreateArtistData): Promise<Artist> => {
  const response = await fetch(`${API_BASE_URL}/artist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(artistData),
  });

  if (!response.ok) {
    throw new Error("Failed to create artist");
  }

  return response.json();
};

const updateArtist = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateArtistData>;
}): Promise<Artist> => {
  const response = await fetch(`${API_BASE_URL}/artist/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update artist");
  }

  return response.json();
};

const deleteArtist = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/artist/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete artist");
  }
};

export const useArtists = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  // Fetch artists list
  const { data, error, isFetching, isPending } = useQuery<
    PaginatedResponse<Artist>
  >({
    queryKey: ["artists", page, limit],
    queryFn: () => fetchArtists(page, limit),
    staleTime: 10 * 1000,
  });

  // Fetch single artist
  const getArtistById = (id: number) => {
    return useQuery<Artist>({
      queryKey: ["artist", id],
      queryFn: () => fetchArtistById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

  // Create artist mutation
  const createArtistMutation = useMutation({
    mutationKey: ["artists"],
    mutationFn: createArtist,
    onMutate: async () => {
      toast.loading("Creating artist...", { id: "artist-create" });
    },
    onSuccess: () => {
      toast.success("Artist created successfully", { id: "artist-create" });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
    onError: (err) => {
      console.error("Error creating artist:", err);
      toast.error("Failed to create artist", { id: "artist-create" });
    },
  });

  // Update artist mutation
  const updateArtistMutation = useMutation({
    mutationKey: ["artists"],
    mutationFn: updateArtist,
    onMutate: async () => {
      toast.loading("Updating artist...", { id: "artist-update" });
    },
    onSuccess: () => {
      toast.success("Artist updated successfully", { id: "artist-update" });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist"] });
    },
    onError: (err) => {
      console.error("Error updating artist:", err);
      toast.error("Failed to update artist", { id: "artist-update" });
    },
  });

  // Delete artist mutation
  const deleteArtistMutation = useMutation({
    mutationKey: ["artists"],
    mutationFn: deleteArtist,
    onMutate: async () => {
      toast.loading("Deleting artist...", { id: "artist-delete" });
    },
    onSuccess: () => {
      toast.success("Artist deleted successfully", { id: "artist-delete" });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
    onError: (err) => {
      console.error("Error deleting artist:", err);
      toast.error("Failed to delete artist", { id: "artist-delete" });
    },
  });

  return {
    // Data
    artists: data?.data || [],
    totalArtists: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    // Loading states
    isLoading: isPending,
    isFetching,
    isCreating: createArtistMutation.isPending,
    isUpdating: updateArtistMutation.isPending,
    isDeleting: deleteArtistMutation.isPending,

    // Error
    error,

    // Actions
    createArtist: createArtistMutation.mutate,
    updateArtist: updateArtistMutation.mutate,
    deleteArtist: deleteArtistMutation.mutate,
    getArtistById,

    // Metadata
    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
