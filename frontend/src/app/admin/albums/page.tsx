"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Music } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAlbums } from "@/lib/hooks/useAlbums";
import { getCurrentUser, hasAccess } from "@/lib/actions/auth";
import { deleteAlbum } from "@/lib/actions/albums";
import { AlbumForm } from "../../../components/forms/album-form";

export default function AlbumsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, loading, error, refetch } = useAlbums(page, 10);

  // For demo purposes - in real app, get from auth context
  const currentUser = {
    id: 1,
    role: "super_admin" as const,
    email: "admin@example.com",
  };

  const canCreate = hasAccess(currentUser.role, "albums", "create");
  const canUpdate = hasAccess(currentUser.role, "albums", "update");
  const canDelete = hasAccess(currentUser.role, "albums", "delete");

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this album?")) {
      try {
        await deleteAlbum(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete album:", error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Albums</h1>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Album
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
              </DialogHeader>
              <AlbumForm
                onSuccess={() => {
                  setIsCreateOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Albums ({data.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((album) => (
              <Card key={album.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage
                      src={album.album_cover || "/placeholder.svg"}
                      alt={album.album_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none">
                      <Music className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {album.album_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {album.artist_name}
                  </p>
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Album</DialogTitle>
                          </DialogHeader>
                          <AlbumForm
                            albumId={album.id}
                            initialData={album}
                            onSuccess={refetch}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(album.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.data.length === 0 && (
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No albums found</h3>
              <p className="text-muted-foreground">
                Get started by creating your first album.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {Math.ceil(data.total / 10)}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(data.total / 10)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
