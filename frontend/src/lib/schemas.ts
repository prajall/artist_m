import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(["user", "artist", "artist_manager", "super_admin"]),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  profile_image: z.file().optional(),

  // artist_name: z.string().optional(),
  // first_release_year: z.coerce
  //   .number()
  //   .min(1900)
  //   .max(new Date().getFullYear())
  //   .optional(),
  // manager_id: z.number().optional(),
});
// .refine(
//   (data) =>
//     data.role !== "artist" ||
//     (!!data.artist_name && !!data.first_release_year),
//   {
//     message: "This field is required for artist",
//     path: ["artist_name", "first_release_year", "manager_id"],
//   }
// );

export const artistSchema = z.object({
  artist_name: z.string().min(1, "Artist name is required"),
  first_release_year: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  user_id: z.number().min(1, "User ID is required"),
  manager_id: z.number().optional(),
});

export const songSchema = z.object({
  title: z.string().min(1, "Song title is required"),
  artist_id: z.number().min(1, "Artist is required"),
  albums: z.string().optional(),
  genre: z.string().optional(),
  song_cover: z.file().optional(),
});

export const albumSchema = z.object({
  album_name: z.string().min(1, "Album name is required"),
  artist_id: z.number().min(1, "Artist is required"),
  album_cover: z.instanceof(File).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type UserFormData = z.infer<typeof userSchema>;
export type ArtistFormData = z.infer<typeof artistSchema>;
export type SongFormData = z.infer<typeof songSchema>;
export type AlbumFormData = z.infer<typeof albumSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
