"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Album, CreateAlbumData, PaginatedResponse } from "@/types";
import { apiRequest } from "../api";

const fetchAlbums = async (
  page: number,
  limit: number,
  artistId?: number
): Promise<PaginatedResponse<Album>> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });

  if (artistId) params.append("artist_id", artistId.toString());

  const response = await apiRequest.get(`/album/?${params.toString()}`);
  const data = response.data?.data;

  console.log("Albums response:", response.data);

  return {
    data: data.albums,
    total: data.total_albums,
    page,
    limit,
  };
};

const fetchAlbumById = async (id: number): Promise<Album> => {
  const response = await apiRequest.get(`/album/${id}/`);
  return response.data;
};

const createAlbum = async (albumData: CreateAlbumData): Promise<Album> => {
  try {
    const formData = new FormData();
    Object.entries(albumData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    const response = await apiRequest.post(`/album/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAlbum = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateAlbumData>;
}): Promise<Album> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });

  const response = await apiRequest.patch(`/album/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const deleteAlbum = async (id: number) => {
  const response = await apiRequest.delete(`/album/${id}/`);
  return response.data;
};

export const useAlbums = (artistId?: number) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  const { data, error, isPending } = useQuery<PaginatedResponse<Album>>({
    queryKey: ["albums", page, limit, artistId],
    queryFn: () => fetchAlbums(page, limit, artistId),
    staleTime: 10 * 1000,
  });

  const getAlbumById = (id: number) => {
    return useQuery<Album>({
      queryKey: ["album", id],
      queryFn: () => fetchAlbumById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

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
    onError: (err: any) => {
      console.error("Error creating album:", err);
      if (err.response) {
        toast.error(err.response.data.message, { id: "album-create" });
      } else {
        toast.error("Failed to create album", { id: "album-create" });
      }
    },
  });

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
    albums: data?.data || [],
    totalAlbums: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    isLoading: isPending,
    isCreating: createAlbumMutation.isPending,
    isUpdating: updateAlbumMutation.isPending,
    isDeleting: deleteAlbumMutation.isPending,

    error,

    createAlbum: createAlbumMutation.mutateAsync,
    updateAlbum: updateAlbumMutation.mutateAsync,
    deleteAlbum: deleteAlbumMutation.mutateAsync,
    getAlbumById,

    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
