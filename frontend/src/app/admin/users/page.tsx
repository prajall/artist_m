"use client";

import Pagination from "@/components/Pagination";
import { useUsers } from "@/lib/hooks/useUsers";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:8000";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const { users, totalUsers, error, isLoading, deleteUser } = useUsers();

  console.log("Users data:", useUsers());

  // const canCreate = hasAccess(currentUser.role, "users", "create");
  // const canUpdate = hasAccess(currentUser.role, "users", "update");
  // const canDelete = hasAccess(currentUser.role, "users", "delete");
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
