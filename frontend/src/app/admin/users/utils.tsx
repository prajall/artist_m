import { Badge } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: Role }) {
  const roleMap = {
    super_admin: {
      component: (
        <Badge className={`text-green-600 bg-green-50 capitalize `}>
          Super Admin
        </Badge>
      ),
    },
    artist_manager: {
      component: (
        <Badge className={`text-cyan-600 bg-cyan-50 capitalize `}>
          Artist Manager
        </Badge>
      ),
    },
    artist: {
      component: (
        <Badge className={`text-indigo-600 bg-indigo-50 capitalize  `}>
          Artist
        </Badge>
      ),
    },
    user: {
      component: (
        <Badge className={`text-neutral-700 bg-neutral-50 capitalize  `}>
          User
        </Badge>
      ),
    },
  };

  const { component } = roleMap[role];
  return component;
}

export type Role = "super_admin" | "artist_manager" | "artist" | "user";
