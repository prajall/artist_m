"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthProvider";
import { apiRequest } from "@/lib/api";
import { User as AuthUserProps } from "@/types";
import { LogOut, ShieldUser, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const UserIcon = () => {
  const { user, setUser } = useAuth();
  console.log("User in user icon", user);

  const router = useRouter();

  const logoutHandler = async () => {
    const response = await apiRequest.post("/user/logout/");
    if (response.status === 205) {
      setUser(null);
      router.push("/login");
    }
  };

  if (!user) {
    return null; // or a loading state
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-50  pr-3">
            <Avatar>
              <AvatarImage src={user.profile_image} />
              <AvatarFallback>
                {user.first_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-4  justify-center">
              <p className=" text-left leading-1 text-sm">
                {user.first_name.charAt(0).toUpperCase() +
                  user.first_name.slice(1)}{" "}
                {user.last_name.charAt(0).toUpperCase() +
                  user.last_name.slice(1)}
              </p>
              <p className="text-muted-foreground text-left leading-0 text-xs">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer">
            <User className="text-neutral-950" /> Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <button
              className="flex gap-2 items-center cursor-pointer "
              onClick={logoutHandler}
            >
              <LogOut className="text-neutral-950" />
              Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserIcon;
