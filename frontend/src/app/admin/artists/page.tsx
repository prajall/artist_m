"use client";

import CustomPagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArtists } from "@/lib/hooks/useArtists";
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ArtistForm } from "../../../components/forms/ArtistForm";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:8000";

export default function ArtistsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { artists, isLoading, error, totalArtists, deleteArtist } =
    useArtists();

  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;
  // const canCreate = hasAccess(currentUser.role, "artists", "create");
  // const canUpdate = hasAccess(currentUser.role, "artists", "update");
  // const canDelete = hasAccess(currentUser.role, "artists", "delete");

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this artist?")) {
      try {
        await deleteArtist(id);
      } catch (error) {
        console.error("Failed to delete artist:", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!artists) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artists</h1>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Artist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Artist</DialogTitle>
              </DialogHeader>
              <ArtistForm
                onSuccess={() => {
                  setIsCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Card
            key={artist.id}
            className="group relative overflow-hidden border-none shadow-none hover:bg-neutral-50/90 p-0"
          >
            <CardContent className="p-4">
              {/* Image Container */}
              <div className="mb-3">
                <div className="aspect-square rounded-full overflow-hidden bg-muted">
                  {artist.profile_image && (
                    <img
                      src={`${SERVER_BASE_URL}/${artist.profile_image}`}
                      alt={artist.artist_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 "
                    />
                  )}
                  {!artist.profile_image && (
                    <img
                      src={
                        "https://www.pixsector.com/cache/517d8be6/av5c8336583e291842624.png"
                      }
                      alt={artist.artist_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-50"
                    />
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8  text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
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
                            <ArtistForm
                              artistId={artist.id}
                              initialData={artist}
                              onSuccess={() => {
                                setIsCreateOpen(false);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(artist.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Artist
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-1 text-center">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {artist.artist_name}
                </h3>

                <p className="text-xs text-muted-foreground truncate">
                  {artist.first_name} {artist.last_name}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomPagination total={totalArtists} />
    </div>
  );
}
