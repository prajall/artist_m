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
import { createSong, updateSong } from "@/lib/actions/songs";
import { getArtists } from "@/lib/actions/artists";
import { Song, Artist } from "@/types";
import { songSchema, SongFormData } from "@/lib/schemas";

interface SongFormProps {
  songId?: number;
  initialData?: Partial<Song>;
  onSuccess: () => void;
}

export function SongForm({ songId, initialData, onSuccess }: SongFormProps) {
  const [artists, setArtists] = useState<Artist[]>([]);

  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: initialData?.title || "",
      artist_id: initialData?.artist_id || 0,
      album_name: initialData?.album_name || "",
      genre: initialData?.genre || "",
      song_cover: initialData?.song_cover || "",
    },
  });

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

  const onSubmit = async (data: SongFormData) => {
    try {
      if (songId) {
        await updateSong(songId, data);
      } else {
        await createSong(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save song:", error);
      form.setError("root", {
        message: "Failed to save song. Please try again.",
      });
    }
  };

  const genres = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Country",
    "Electronic",
    "Jazz",
    "Classical",
    "Folk",
    "Blues",
    "Reggae",
    "Alternative",
    "Indie",
  ];

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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Song Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter song title" {...field} />
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
          name="album_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter album name or leave empty for single"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
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
          name="song_cover"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Song Cover URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
            : songId
            ? "Update Song"
            : "Create Song"}
        </Button>
      </form>
    </Form>
  );
}
