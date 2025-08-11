"use client";

import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthProvider";
import { useUsers } from "@/lib/hooks/useUsers";
import { redirect } from "next/navigation";
import React from "react";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user?.id) {
    return <div>Loading...</div>;
  }

  const { getUserById } = useUsers();
  const { data, isLoading, isError, error } = getUserById(user!.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    console.error(error);
    return <div>Failed to load profile.</div>;
  }

  if (!data) {
    return <div>No user data found.</div>;
  }

  return (
    <div>
      <UserProfile user={data.data} />
    </div>
  );
};

export default ProfilePage;
