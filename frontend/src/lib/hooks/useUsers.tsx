"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { User, CreateUserData, PaginatedResponse } from "@/types";
import { apiRequest } from "../api";

const fetchUsers = async (
  page: number,
  limit: number
): Promise<PaginatedResponse<User>> => {
  const response = await apiRequest.get(`/user/?limit=${limit}&page=${page}`);
  const data = await response.data?.data;
  console.log("Fetched users:", data);
  return {
    data: data.users,
    total: data.total_users,
    page,
    limit,
  };
};

const fetchUserById = async (id: number): Promise<User> => {
  const response = await apiRequest.get(`/user/${id}/`);

  return response.data;
};

const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    const response = await apiRequest.post(`/user/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateUser = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<CreateUserData>;
}): Promise<User> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });
  const response = await apiRequest.patch(`/user/${id}/`, formData);

  return response.data;
};

const deleteUser = async (id: number) => {
  console.log("Deleting user");
  const response = await apiRequest.delete(`/user/${id}/`);
  console.log("Deleted user", response);
};

export const useUsers = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const { data, error, isFetching, isPending } = useQuery<
    PaginatedResponse<User>
  >({
    queryKey: ["users", page, limit],
    queryFn: () => fetchUsers(page, limit),
    staleTime: 10 * 1000,
  });

  const getUserById = (id: number) => {
    return useQuery<User>({
      queryKey: ["user", id],
      queryFn: () => fetchUserById(id),
      staleTime: 10 * 1000,
      enabled: !!id,
    });
  };

  const createUserMutation = useMutation({
    mutationKey: ["users"],
    mutationFn: createUser,
    onMutate: async () => {
      toast.loading("Creating user...", { id: "user-create" });
    },
    onSuccess: () => {
      toast.success("User created successfully", { id: "user-create" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      console.log("Error creating user:", err);
      if (err.response) {
        toast.error(err.response.data.message, { id: "user-create" });
      } else {
        toast.error("Failed to create user", { id: "user-create" });
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationKey: ["users"],
    mutationFn: updateUser,
    onMutate: async () => {
      toast.loading("Updating user...", { id: "user-update" });
    },
    onSuccess: () => {
      toast.success("User updated successfully", { id: "user-update" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err) => {
      console.log("Error updating user:", err);
      toast.error("Failed to update user", { id: "user-update" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationKey: ["users"],
    mutationFn: deleteUser,
    onMutate: async () => {
      toast.loading("Deleting user...", { id: "user-delete" });
    },
    onSuccess: () => {
      toast.success("User deleted successfully", { id: "user-delete" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      console.log("Error deleting user:", err);
      toast.error("Failed to delete user", { id: "user-delete" });
    },
  });

  return {
    users: data?.data || [],
    totalUsers: data?.total || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.total / limit) : 0,

    isLoading: isPending,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,

    error,

    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    getUserById,

    metaData: {
      count: data?.total,
      page: data?.page,
      limit: data?.limit,
    },
  };
};
