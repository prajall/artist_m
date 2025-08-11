"use client";

import { useState, useEffect, useRef } from "react";
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
import { Song, Artist, Album } from "@/types";
import { songSchema, SongFormData } from "@/lib/schemas";
import { useSongs } from "@/lib/hooks/useSongs";
import { apiRequest } from "@/lib/api";
import { ImagePlus, X } from "lucide-react";

interface SongFormProps {
  songId?: number;
  initialData?: Partial<Song>;
  onSuccess: () => void;
}

export function SongForm({ songId, initialData, onSuccess }: SongFormProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);

  const { createSong, updateSong } = useSongs();
  const [image, setImage] = useState<File | null>(null);
  const { getSongById } = useSongs();
  const { data: song }: { data: any } = getSongById(songId || 0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  console.log("getSong", song?.data);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files![0]);
  };

  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: initialData?.title || "",
      artist_id: initialData?.artist_id || 0,
      // albums: initialData?.albums?.toString() || undefined,
      genre: initialData?.genre || "",
      song_cover: undefined,
    },
  });

  useEffect(() => {
    const getArtists = async () => {
      try {
        const res = await apiRequest.get("/artist/");
        setArtists(res.data?.data.artists);
      } catch (err) {
        console.log("Failed to fetch artists:", err);
      }
    };

    const getAlbums = async () => {
      try {
        const res = await apiRequest.get("/album/?limit=100");
        setAlbums(res.data?.data.albums);
      } catch (err) {
        console.log("Failed to fetch albums:", err);
      }
    };

    getArtists();
    getAlbums();
  }, []);

  const toggleAlbum = (albumId: number) => {
    setSelectedAlbumIds((prev) =>
      prev.includes(albumId)
        ? prev.filter((id) => id !== albumId)
        : [...prev, albumId]
    );
  };

  const handleAlbumChange = async () => {
    console.log("handle album change");
    const albumsToAdd = selectedAlbumIds.filter(
      (id) => !song?.data?.albums.includes(id)
    );
    const albumsToRemove = song?.data?.albums.filter(
      (id: number) => !selectedAlbumIds.includes(id)
    );

    if (albumsToAdd.length > 0) {
      for (const albumId of albumsToAdd) {
        await apiRequest.post(`/album/album-song/`, {
          album_id: albumId,
          song_id: songId,
        });
      }
    }
    if (albumsToRemove.length > 0) {
      for (const albumId of albumsToRemove) {
        await apiRequest.delete(`/album/album-song/`, {
          data: { album_id: albumId, song_id: songId },
        });
      }
    }
  };

  const onSubmit = async (data: SongFormData) => {
    try {
      if (image) {
        data.song_cover = image;
      }
      data.albums = JSON.stringify(selectedAlbumIds);
      console.log("albums", data.albums);
      if (songId) {
        delete data.albums;
        console.log("here");
        await handleAlbumChange();
        await updateSong({ id: songId, data });
      } else {
        await createSong(data);
      }
      onSuccess();
    } catch (error: any) {
      console.log("Failed to save user:", error);

      if (error.response) {
        const details = error.response.data?.detail;

        form.setError("root", {
          message:
            error.response.data?.message ||
            "Failed to save user. Please try again.",
        });

        if (details && typeof details === "object") {
          Object.entries(details).forEach(([key, value]) => {
            if (key in form.getValues()) {
              form.setError(key as any, {
                message: value as string,
              });
            } else {
              form.setError("root", {
                message: value as string,
              });
            }
          });
        } else {
          form.setError("root", {
            message: details || "Failed to save user. Please try again.",
          });
        }
      } else {
        form.setError("root", {
          message: "Failed to save user. Please try again.",
        });
      }
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

  useEffect(() => {
    console.log("albums", albums);
    console.log("Artist", form.watch("artist_id"));
    // console.log("filtered", filtered);
    const filtered = albums.filter(
      (album) => album.artist_id === form.watch("artist_id")
    );
    const filteredSelectedAlbumIds = selectedAlbumIds.filter((id) =>
      filtered.some((album) => album.id === id)
    );
    setSelectedAlbumIds(filteredSelectedAlbumIds);
    setFilteredAlbums(filtered);
  }, [albums, form.watch("artist_id")]);

  useEffect(() => {
    console.log("song", song);

    if (songId && song) {
      console.log("albums in song", song.data?.albums);
      setSelectedAlbumIds(song.data?.albums || []);
    }
  }, [song]);

  useEffect(() => {
    console.log("selectedAlbumIds", selectedAlbumIds);
  }, [selectedAlbumIds]);

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="artist_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  disabled={!!songId}
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
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        </div>

        <div>
          <FormLabel>Add to Albums</FormLabel>
          <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar">
            {filteredAlbums.map((album) => {
              const isSelected = selectedAlbumIds.includes(album.id);
              return (
                <div
                  key={album.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded-full border text-sm whitespace-nowrap cursor-pointer transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggleAlbum(album.id)}
                >
                  <span className="truncate max-w-[120px]">
                    {album.album_name}
                  </span>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAlbum(album.id);
                      }}
                      className="rounded-full p-0.5 hover:bg-blue-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        {image && (
          <div className="relative w-24 h-24">
            <img
              src={URL.createObjectURL(image)}
              alt=""
              className="w-full h-full object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-80"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            imageInputRef.current?.click();
          }}
        >
          <ImagePlus size={15} className="mr-1" />
          Add Image
        </Button>

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
