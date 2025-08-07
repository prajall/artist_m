import { UserRole } from "@/types";

type PermissionMap = {
  [resource: string]: string[];
};

const permissions: Record<UserRole, PermissionMap> = {
  super_admin: {
    users: ["create", "read", "update", "delete"],
    artists: ["create", "read", "update", "delete"],
    managers: ["create", "read", "update", "delete"],
    songs: ["create", "read", "update", "delete"],
    albums: ["create", "read", "update", "delete"],
  },
  artist_manager: {
    artists: ["read", "update"],
    songs: ["read"],
    albums: ["read"],
  },
  artist: {
    songs: ["create", "read", "update", "delete"],
    albums: ["create", "read", "update", "delete"],
  },
};

export function hasAccess(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  return permissions[userRole]?.[resource]?.includes(action) || false;
}

// export async function getCurrentUser(): Promise<User | null> {
//   try {
//     const cookieStore = await cookies();
//     const userInfo = cookieStore.get("user-info");

//     if (userInfo) {
//       return JSON.parse(userInfo.value);
//     }

//     return null;
//   } catch {
//     return null;
//   }
// }
