"use client";

import CustomPagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArtists } from "@/lib/hooks/useArtists";
import { Edit, Eye, Import, MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
import ArtistPopover from "./ArtistDetail";
import ArtistCSVForm from "@/components/forms/ArtistCSVForm";
import { hasAccess } from "@/lib/actions/permission";
import { useAuth } from "@/contexts/AuthProvider";

export default function ArtistsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const { artists, isLoading, error, totalArtists, deleteArtist } =
    useArtists();

  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;
  const canCreate = hasAccess(user, "album", "create");
  const canUpdate = hasAccess(user, "album", "update");
  const canDelete = hasAccess(user, "album", "delete");
  const canView = hasAccess(user, "album", "view");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!artists) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artists</h1>
        {canCreate && (
          <div className="flex gap-2">
            <Dialog open={isCSVOpen} onOpenChange={setIsCSVOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Import className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Import Artists from CSV</DialogTitle>
                </DialogHeader>
                <ArtistCSVForm />
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Artist
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
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
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <ArtistPopover artist={artist} key={artist.id} />
        ))}
      </div>

      <CustomPagination total={totalArtists} />
    </div>
  );
}
