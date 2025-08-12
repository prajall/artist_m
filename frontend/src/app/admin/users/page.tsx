"use client";

import Pagination from "@/components/Pagination";
import { useUsers } from "@/lib/hooks/useUsers";
import { Edit, Eye, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserForm } from "../../../components/forms/UserForm";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { RoleBadge } from "./utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { hasAccess } from "@/lib/actions/permission";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:8000";

export default function UsersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { users, totalUsers, error, isLoading, deleteUser } = useUsers();
  const router = useRouter();

  if (!user) return <div>Loading...</div>;

  const canCreate = hasAccess(user, "user", "create");
  const canUpdate = hasAccess(user, "user", "update");
  const canDelete = hasAccess(user, "user", "delete");
  const canView = hasAccess(user, "user", "view");

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
    } catch (error) {
      console.log("Failed to delete user:", error);
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  // if (error) return <div>Error: {error}</div>;
  if (!users) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users ({totalUsers}) </h1>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] ">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <UserForm
                onSuccess={() => {
                  setIsCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="flex items-center justify-between">
        <form
          className="flex items-center gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/admin/users?search=${search}`);
          }}
        >
          <Input
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="w-full"
          />
          <Button type="submit" variant="outline" className="rounded-md">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.profile_image && (
                  <img
                    src={`${SERVER_BASE_URL}/${user.profile_image}`}
                    alt=""
                    className="w-8 h-8 rounded-md object-cover"
                  />
                )}
                {!user.profile_image && (
                  <img
                    src={
                      "https://www.pixsector.com/cache/517d8be6/av5c8336583e291842624.png"
                    }
                    alt=""
                    className="w-8 h-8 rounded-md object-cover opacity-50"
                  />
                )}
              </TableCell>
              <TableCell className="flex gap-2 items-center">
                {user.first_name.charAt(0).toUpperCase() +
                  user.first_name.slice(1)}{" "}
                {user.last_name.charAt(0).toUpperCase() +
                  user.last_name.slice(1)}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="">
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>{user.phone || "N/A"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canUpdate && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <UserForm
                          userId={user.id}
                          initialData={user}
                          onSuccess={() => {}}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  {canDelete && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          // onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Delete User</DialogTitle>
                        </DialogHeader>
                        {user.role === "artist" ? (
                          <p className="text-sm ">
                            This will also delete artist and their related songs
                            and albums
                          </p>
                        ) : (
                          <p className="text-sm ">
                            This will delete user and related datas.
                          </p>
                        )}
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users && users.length > 0 && <Pagination total={totalUsers} />}
    </div>
  );
}
