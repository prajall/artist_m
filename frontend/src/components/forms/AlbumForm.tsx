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
import { Album, Artist } from "@/types";
import { albumSchema, AlbumFormData } from "@/lib/schemas";
import { useArtists } from "@/lib/hooks/useArtists";
import { useAlbums } from "@/lib/hooks/useAlbums";
import { ImagePlus, X } from "lucide-react";

interface AlbumFormProps {
  albumId?: number;
  initialData?: Partial<Album>;
  onSuccess: () => void;
}

export function AlbumForm({ albumId, initialData, onSuccess }: AlbumFormProps) {
  const { albums, isLoading, error, createAlbum, updateAlbum } = useAlbums();
  const { artists } = useArtists();

  const [image, setImage] = useState<File | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      album_name: initialData?.album_name || "",
      artist_id: initialData?.artist_id || 0,
      album_cover: undefined,
    },
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files![0]);
  };

  const onSubmit = async (data: AlbumFormData) => {
    try {
      if (albumId) {
        await updateAlbum({ id: albumId, data });
      } else {
        await createAlbum(data);
      }
      onSuccess();
    } catch (error: any) {
      console.log("Failed to save album:", error);

      if (error.response) {
        const details = error.response.data?.detail;

        form.setError("root", {
          message:
            error.response.data?.message ||
            "Failed to save album. Please try again.",
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
            message: details || "Failed to save album. Please try again.",
          });
        }
      } else {
        form.setError("root", {
          message: "Failed to save album. Please try again.",
        });
      }
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

        <input
          type="file"
          multiple
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        {image && (
          // <img src={URL.createObjectURL(image)} alt="" />
          <div className="relative w-24 h-24">
            <img
              src={URL.createObjectURL(image)}
              alt={``}
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
          className="bg-white flex items-center justify-center gap-1 text-black mt-1"
          onClick={(e) => {
            e.preventDefault();
            imageInputRef.current?.click();
          }}
        >
          <ImagePlus size={15} />
          Add Image
        </Button>

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
