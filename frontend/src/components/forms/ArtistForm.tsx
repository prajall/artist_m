"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/api";
import { useArtists } from "@/lib/hooks/useArtists";
import { ArtistFormData, artistSchema } from "@/lib/schemas";
import { Artist, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:8000";

interface ArtistFormProps {
  artistId?: number;
  initialData?: Partial<Artist>;
  onSuccess: () => void;
}

const searchUsers = async (query: string, role: string): Promise<User[]> => {
  try {
    const response = await apiRequest.get(
      `/user/?search=${encodeURIComponent(query)}&role=${role}`
    );
    return response.data?.data.users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// User Search Component
const UserSearch = ({
  role,
  value,
  onChange,
  placeholder = "Search users...",
  label = "Select User",
}: {
  role: string;
  value?: number;
  onChange: (userId: number | undefined) => void;
  placeholder?: string;
  label?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(query, role);
        setUsers(results);
      } catch (error) {
        console.error("Search failed:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (value && users.length > 0) {
      const user = users.find((u) => u.id === value);
      if (user) {
        setSelectedUser(user);
      }
    } else if (!value) {
      setSelectedUser(null);
    }
  }, [value, users]);

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    onChange(user.id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // role="combobox"
            // aria-expanded={open}
            className="flex-1 justify-between"
          >
            {selectedUser ? (
              <span className="truncate">
                {selectedUser.first_name} {selectedUser.last_name} (
                {selectedUser.email})
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
            />
            <CommandEmpty>
              {loading
                ? "Searching..."
                : query.length < 2
                ? "Type to search users"
                : "No users found."}
            </CommandEmpty>
            {users.length > 0 && (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.first_name} ${user.last_name} ${user.email}`}
                    onSelect={() => handleSelect(user)}
                  >
                    {user.profile_image && (
                      <img
                        src={`${SERVER_BASE_URL}/${user.profile_image}`}
                        alt={""}
                        className="h-8 w-8 object-cover group-hover:scale-105 transition-transform duration-300 rounded-md"
                      />
                    )}
                    {!user.profile_image && (
                      <img
                        src={
                          "https://www.pixsector.com/cache/517d8be6/av5c8336583e291842624.png"
                        }
                        alt={""}
                        className="h-8 w-8 object-cover group-hover:scale-105 transition-transform duration-300 opacity-50 rounded-md"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.first_name} {user.last_name} ({user.role})
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

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

  const { artists, createArtist, updateArtist } = useArtists();

  const onSubmit = async (data: ArtistFormData) => {
    try {
      if (artistId) {
        await updateArtist({ id: artistId, data });
      } else {
        await createArtist(data);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save user:", error);

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
        {!artistId && (
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User *</FormLabel>
                <FormControl>
                  <UserSearch
                    role="user"
                    value={field.value || undefined}
                    onChange={(userId) => field.onChange(userId || 0)}
                    placeholder="Search and select user..."
                    label="User"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="manager_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager (Optional)</FormLabel>
              <FormControl>
                <UserSearch
                  role="artist_manager"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search and select manager..."
                  label="Manager"
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
