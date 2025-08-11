import { User } from "@/types";

const permissions = {
  artist_manager: {
    song: ["create", "update", "delete", "view"],
    user: ["view"],
    album: ["create", "update", "delete", "view"],
    artist: ["create", "update", "delete", "view"],
  },
  super_admin: {
    song: ["create", "update", "delete", "view"],
    user: ["create", "update", "delete", "view"],
    album: ["create", "update", "delete", "view"],
    artist: ["create", "update", "delete", "view"],
  },
  artist: {
    song: ["create", "update", "delete", "view"],
    user: [],
    album: ["create", "update", "delete", "view"],
    artist: [],
  },
};

export const hasAccess = (user: User, resource: string, action: string) => {
  if (!user.role) {
    return false;
  }
  if (user.role === "super_admin") {
    return true;
  }
  const userPermissions = permissions[user.role as keyof typeof permissions];
  if (!userPermissions) return false;
  const entity = userPermissions[resource as keyof typeof userPermissions];
  return Array.isArray(entity) && entity.includes(action as never);
};
