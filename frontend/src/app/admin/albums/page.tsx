"use client";

import CustomPagination from "@/components/Pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAlbums } from "@/lib/hooks/useAlbums";
import {
  Edit,
  EllipsisIcon,
  EllipsisVertical,
  Eye,
  Menu,
  MoreHorizontal,
  Music,
  Option,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AlbumForm } from "../../../components/forms/AlbumForm";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

console.log(SERVER_BASE_URL);

export default function AlbumsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { albums, isLoading, error, deleteAlbum, totalAlbums } = useAlbums();

  // const canCreate = hasAccess(currentUser.role, "albums", "create");
  // const canUpdate = hasAccess(currentUser.role, "albums", "update");
  // const canDelete = hasAccess(currentUser.role, "albums", "delete");
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this album?")) {
      try {
        await deleteAlbum(id);
      } catch (error) {
        console.error("Failed to delete album:", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!albums) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Albums ({totalAlbums})</h1>
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
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Card
            key={album.id}
            className="overflow-hidden border-none shadow-none p-0 rounded-none"
          >
            <div className="aspect-square relative ">
              <Avatar className="w-full h-full rounded-none">
                {album.album_cover && (
                  <>
                    <AvatarImage
                      src={SERVER_BASE_URL + album.album_cover}
                      alt={album.album_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none">
                      <Music className="h-12 w-12" />
                    </AvatarFallback>
                  </>
                )}
                {!album.album_cover && (
                  <AvatarFallback className="rounded-none">
                    <Music className="h-12 w-12" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardContent className="p-0 flex justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {album.album_name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  by {album.artist_name}
                </p>
              </div>

              <div className="">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8  text-black  transition-opacity duration-300"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {}}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {canUpdate && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Artist
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Artist</DialogTitle>
                          </DialogHeader>
                          <AlbumForm
                            albumId={album.id}
                            initialData={album}
                            onSuccess={() => {
                              setIsCreateOpen(false);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(album.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Artist
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* <div className="flex items-center gap-2">
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
                            onSuccess={() => {
                              setIsCreateOpen(false);
                            }}
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
                  </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No albums found</h3>
        </div>
      )}

      <CustomPagination total={totalAlbums} />
    </div>
  );
}
