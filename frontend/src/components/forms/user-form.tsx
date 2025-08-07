"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { User } from "@/types";
import { userSchema, UserFormData } from "@/lib/schemas";
import { useUsers } from "@/lib/hooks/useUsers";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

interface UserFormProps {
  userId?: number;
  initialData?: Partial<User>;
  onSuccess: () => void;
}

export function UserForm({ userId, initialData, onSuccess }: UserFormProps) {
  const { createUser, updateUser, error } = useUsers();
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email || "admin@gmail.com",
      password: "password",
      first_name: initialData?.first_name || "first",
      last_name: initialData?.last_name || "last",
      role: initialData?.role || "user",
      phone: initialData?.phone || "9840000000",
      gender: initialData?.gender || "male" || undefined,
      address: initialData?.address || "dallu",
      dob: initialData?.dob || "2020-10-10",
    },
  });
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files![0]);
  };

  const onSubmit = async (data: UserFormData) => {
    console.log("Form data:", data, userId);

    if (image) {
      data.profile_image = image;
    }

    try {
      if (userId) {
        updateUser({ id: userId, data });
      } else {
        await createUser(data);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save user:", error);

      if (error.response) {
        const details = error.response.data?.detail;

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="artist_manager">
                      Artist Manager
                    </SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
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
            : userId
            ? "Update User"
            : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
