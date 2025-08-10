"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Artist } from "@/types";
import { Edit, Trash } from "lucide-react";
import { ArtistForm } from "@/components/forms/ArtistForm";
import { useState } from "react";
import { useArtists } from "@/lib/hooks/useArtists";
import { Card, CardContent } from "@/components/ui/card";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

export default function ArtistPopover({ artist }: { artist: Artist }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { deleteArtist } = useArtists();

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this artist?")) {
      try {
        await deleteArtist(id);
      } catch (error) {
        console.error("Failed to delete artist:", error);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          key={artist.id}
          className="group relative overflow-hidden border-none shadow-none hover:bg-neutral-50/90 p-0 cursor-pointer"
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
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {artist.artist_name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="flex gap-5 items-center">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
              {artist.profile_image && (
                <Image
                  src={`${SERVER_BASE_URL}${artist.profile_image}`}
                  alt={artist.artist_name}
                  fill
                  className="object-cover"
                />
              )}
              {!artist.profile_image && (
                <Image
                  src={
                    "https://www.pixsector.com/cache/517d8be6/av5c8336583e291842624.png"
                  }
                  alt={artist.artist_name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">
                Name:{" "}
                <span className="font-normal">
                  {artist.first_name.charAt(0).toUpperCase() +
                    artist.first_name.slice(1)}{" "}
                  {artist.last_name.charAt(0).toUpperCase() +
                    artist.last_name.slice(1)}
                </span>
              </p>
              <p className="text-sm ">
                Email:{" "}
                <span className="font-normal text-muted-foreground">
                  {artist.email}
                </span>
              </p>
              <p className="text-sm ">
                Phone:{" "}
                <span className="font-normal text-muted-foreground">
                  {artist.phone}
                </span>
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <InfoBlock label="Address" value={artist.address} />
            <InfoBlock label="Gender" value={artist.gender} />
            <InfoBlock
              label="First Release Year"
              value={artist.first_release_year}
            />
            <InfoBlock
              label="Created At"
              value={new Date(artist.created_at).toLocaleString()}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">Manager Details</h3>
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="font-medium">
                {artist.manager_first_name} {artist.manager_last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {artist.manager_email}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2 justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="rounded-lg">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
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
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-lg text-red-500 hover:text-red-600"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete Artist?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  This will also delete all the songs related to this artist.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => setIsDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(artist.id)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-muted p-3 rounded-lg">
      <p className="text-xs text-muted-foreground">
        {/* capitalize the first letter */}
        {label.charAt(0).toUpperCase() + label.slice(1)}:
      </p>
      <p className="font-medium">
        {typeof value === "string"
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : value}
      </p>
    </div>
  );
}
