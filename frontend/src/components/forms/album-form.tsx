"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createAlbum, updateAlbum } from "@/lib/actions/albums";
import { getArtists } from "@/lib/actions/artists";
import { Album, Artist } from "@/types";
import { albumSchema, AlbumFormData } from "@/lib/schemas";

interface AlbumFormProps {
  albumId?: number;
  initialData?: Partial<Album>;
  onSuccess: () => void;
}

export function AlbumForm({ albumId, initialData, onSuccess }: AlbumFormProps) {
  const [artists, setArtists] = useState<Artist[]>([]);

  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      album_name: initialData?.album_name || "",
      artist_id: initialData?.artist_id || 0,
      album_cover: initialData?.album_cover || "",
    },
  });

  const watchedCover = form.watch("album_cover");

  useEffect(() => {
    async function fetchArtists() {
      try {
        const response = await getArtists(1, 100);
        setArtists(response.data);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    }
    fetchArtists();
  }, []);

  const onSubmit = async (data: AlbumFormData) => {
    try {
      if (albumId) {
        await updateAlbum(albumId, data);
      } else {
        await createAlbum(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save album:", error);
      form.setError("root", {
        message: "Failed to save album. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="album_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter album name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="artist_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id.toString()}>
                      {artist.artist_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="album_cover"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Cover URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/album-cover.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {watchedCover && (
                <div className="mt-2">
                  <img
                    src={watchedCover || "/placeholder.svg"}
                    alt="Album cover preview"
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : albumId
            ? "Update Album"
            : "Create Album"}
        </Button>
      </form>
    </Form>
  );
}
