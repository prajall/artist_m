"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { hasAccess } from "@/lib/actions/auth";
import { Edit, Eye, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SongForm } from "../../../components/forms/SongForm";
import { Badge } from "../../../components/ui/badge";
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
import { useSongs } from "@/lib/hooks/useSongs";
import { PaginationContent } from "@/components/ui/pagination";
import CustomPagination from "@/components/Pagination";
import { hasAccess } from "@/lib/actions/permission";
import { useAuth } from "@/contexts/AuthProvider";
import { SongDetail } from "./components/SongDetail";

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:8000";

console.log(SERVER_BASE_URL);
export default function SongsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openSongId, setOpenSongId] = useState<number | null>(null);

  const { songs, isLoading, error, deleteSong, totalSongs } = useSongs();

  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;
  const canCreate = hasAccess(user, "song", "create");
  const canUpdate = hasAccess(user, "song", "update");
  const canDelete = hasAccess(user, "song", "delete");
  const canView = hasAccess(user, "song", "view");

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this song?")) {
      try {
        await deleteSong(id);
      } catch (error) {
        console.log("Failed to delete song:", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Songs({totalSongs})</h1>
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
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="text-muted-foreground text-sm">
            <TableHead>Title</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell className="flex items-center gap-2 py-4">
                <Avatar className="h-10 w-10 rounded-sm">
                  {song.song_cover && (
                    <>
                      <AvatarImage
                        src={SERVER_BASE_URL + song.song_cover}
                        alt={song.title}
                        className="object-cover "
                      />
                      <AvatarFallback>
                        <Play className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                  {!song.song_cover && (
                    <AvatarFallback>
                      <Play className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {song.artist_name}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {song.genre && <Badge variant="secondary">{song.genre}</Badge>}
              </TableCell>
              <TableCell>
                {new Date(song.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenSongId(song.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Dialog
                    open={openSongId === song.id}
                    onOpenChange={(isOpen) => !isOpen && setOpenSongId(null)}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Song Details</DialogTitle>
                      </DialogHeader>
                      <SongDetail song={song} />
                    </DialogContent>
                  </Dialog>
                  {canUpdate && (
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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

      <CustomPagination total={totalSongs} />
    </div>
  );
}
