"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Artist, CreateArtistData, PaginatedResponse } from "@/types";
import { apiRequest } from "../api";

const fetchArtists = async (
  page: number,
  limit: number
): Promise<PaginatedResponse<Artist>> => {
  const response = await apiRequest.get(`/artist/?limit=${limit}&page=${page}`);
  const data = await response.data?.data;
  console.log("Fetched artists:", data);
  return {
    data: data.artists,
    total: data.total_artists,
    page,
    limit,
  };
};

const fetchArtistById = async (id: number): Promise<Artist> => {
  const response = await apiRequest.get(`/artist/${id}/`);
  return response.data;
};

const createArtist = async (artistData: CreateArtistData): Promise<Artist> => {
  const response = await apiRequest.post(`/artist/`, artistData);

  return response.data;
};

const updateArtist = async ({
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

const deleteArtist = async (id: number): Promise<void> => {
  return await apiRequest.delete(`/artist/${id}/`);
};

export const useArtists = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  const { data, error, isFetching, isPending } = useQuery<
    PaginatedResponse<Artist>
  >({
    queryKey: ["artists", page, limit],
    queryFn: () => fetchArtists(page, limit),
    staleTime: 10 * 1000,
  });

  const getArtistById = (id: number) => {
    return useQuery<Artist>({
      queryKey: ["artist", id],
      queryFn: () => fetchArtistById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

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
    artists: data?.data || [],
    totalArtists: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    isLoading: isPending,
    isCreating: createArtistMutation.isPending,
    isUpdating: updateArtistMutation.isPending,
    isDeleting: deleteArtistMutation.isPending,

    error,

    createArtist: createArtistMutation.mutateAsync,
    updateArtist: updateArtistMutation.mutateAsync,
    deleteArtist: deleteArtistMutation.mutateAsync,
    getArtistById,

    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
