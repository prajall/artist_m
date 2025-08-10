"use client";

import { Users, Music, UserCheck, Disc, Album, LogOut } from "lucide-react";
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

const menuItems = [
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    resource: "users",
  },
  {
    title: "Artists",
    url: "/admin/artists",
    icon: UserCheck,
    resource: "artists",
  },
  {
    title: "Managers",
    url: "/admin/managers",
    icon: Users,
    resource: "managers",
  },
  {
    title: "Songs",
    url: "/admin/songs",
    icon: Music,
    resource: "songs",
  },
  {
    title: "Albums",
    url: "/admin/albums",
    icon: Album,
    resource: "albums",
  },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const router = useRouter();

  // const filteredMenuItems = menuItems.filter((item) =>
  //   hasAccess(currentUser.role, item.resource, "read")
  // );

  const handleLogout = async () => {
    router.push("/login");
  };

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
              {menuItems.map((item) => (
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
