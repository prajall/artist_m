"use client";

import {
  Users,
  Music,
  UserCheck,
  Disc,
  Album,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { hasAccess } from "@/lib/actions/permission";

const menuItems = [
  {
    title: "Profile",
    url: "/admin/profile",
    icon: User,
    resource: "profile",
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    resource: "user",
  },
  {
    title: "Artists",
    url: "/admin/artists",
    icon: UserCheck,
    resource: "artist",
  },
  {
    title: "Songs",
    url: "/admin/songs",
    icon: Music,
    resource: "song",
  },
  {
    title: "Albums",
    url: "/admin/albums",
    icon: Album,
    resource: "album",
  },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user)
    return (
      <div className="w-64">
        <div className="flex gap-2 px-4 py-6">
          <span className="font-semibold">Artist Management</span>
        </div>
        <div className=" h-[80vh] flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );

  const filteredMenuItems =
    menuItems.filter(
      (item) =>
        hasAccess(user, item.resource, "view") || item.url === "/admin/profile"
    ) || [];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <span className="font-semibold">Artist Management</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="group">
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className=" ">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
