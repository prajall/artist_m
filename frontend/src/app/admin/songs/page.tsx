"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Play } from "lucide-react";
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
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSongs } from "@/lib/hooks/useSongs";
import { getCurrentUser, hasAccess } from "@/lib/actions/auth";
import { deleteSong } from "@/lib/actions/songs";
import { SongForm } from "../../../components/forms/song-form";

export default function SongsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, loading, error, refetch } = useSongs(page, 10);

  // For demo purposes - in real app, get from auth context
  const currentUser = {
    id: 1,
    role: "super_admin" as const,
    email: "admin@example.com",
  };

  const canCreate = hasAccess(currentUser.role, "songs", "create");
  const canUpdate = hasAccess(currentUser.role, "songs", "update");
  const canDelete = hasAccess(currentUser.role, "songs", "delete");

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this song?")) {
      try {
        await deleteSong(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete song:", error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Songs</h1>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Song
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Song</DialogTitle>
              </DialogHeader>
              <SongForm
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
          <CardTitle>All Songs ({data.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((song) => (
                <TableRow key={song.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={song.song_cover || "/placeholder.svg"}
                        alt={song.title}
                      />
                      <AvatarFallback>
                        <Play className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist_name}</TableCell>
                  <TableCell>{song.album_name || "Single"}</TableCell>
                  <TableCell>
                    {song.genre && (
                      <Badge variant="secondary">{song.genre}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(song.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
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
                              <DialogTitle>Edit Song</DialogTitle>
                            </DialogHeader>
                            <SongForm
                              songId={song.id}
                              initialData={song}
                              onSuccess={refetch}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(song.id)}
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
