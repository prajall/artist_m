"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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
import { useArtists } from "@/lib/hooks/useArtists";
import { deleteArtist } from "@/lib/actions/artists";
import { ArtistForm } from "../../../components/forms/artist-form";

export default function ArtistsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, loading, error } = useArtists(page, 10);

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
        refetch();
      } catch (error) {
        console.error("Failed to delete artist:", error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

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
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Artists ({data.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist Name</TableHead>
                <TableHead>Real Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>First Release</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">
                    {artist.artist_name}
                  </TableCell>
                  <TableCell>
                    {artist.first_name} {artist.last_name}
                  </TableCell>
                  <TableCell>{artist.email}</TableCell>
                  <TableCell>
                    {artist.manager_first_name && artist.manager_last_name
                      ? `${artist.manager_first_name} ${artist.manager_last_name}`
                      : "No Manager"}
                  </TableCell>
                  <TableCell>{artist.first_release_year || "N/A"}</TableCell>
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
                              <DialogTitle>Edit Artist</DialogTitle>
                            </DialogHeader>
                            <ArtistForm
                              artistId={artist.id}
                              initialData={artist}
                              onSuccess={refetch}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(artist.id)}
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
