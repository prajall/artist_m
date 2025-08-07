"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createArtist, updateArtist } from "@/lib/actions/artists";
import { Artist } from "@/types";
import { artistSchema, ArtistFormData } from "@/lib/schemas";

interface ArtistFormProps {
  artistId?: number;
  initialData?: Partial<Artist>;
  onSuccess: () => void;
}

export function ArtistForm({
  artistId,
  initialData,
  onSuccess,
}: ArtistFormProps) {
  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      artist_name: initialData?.artist_name || "",
      first_release_year: initialData?.first_release_year || undefined,
      user_id: initialData?.user_id || 0,
      manager_id: initialData?.manager_id || undefined,
    },
  });

  const onSubmit = async (data: ArtistFormData) => {
    try {
      if (artistId) {
        await updateArtist(artistId, data);
      } else {
        await createArtist(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save artist:", error);
      form.setError("root", {
        message: "Failed to save artist. Please try again.",
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
          name="artist_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter artist name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter user ID"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manager_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter manager ID"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_release_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Release Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter first release year"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
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
            : artistId
            ? "Update Artist"
            : "Create Artist"}
        </Button>
      </form>
    </Form>
  );
}
