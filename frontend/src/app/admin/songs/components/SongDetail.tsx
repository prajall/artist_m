"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Disc, Music2, Play, User } from "lucide-react";

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:8000";

export function SongDetail({ song }: { song: any }) {
  const getSongAlbums = async (songId: number) => {
    const res = await apiRequest.get(`/album/songs/${songId}/`);
    return res.data?.data;
  };

  const { data: albums } = useQuery({
    queryKey: ["song-albums", song.id],
    queryFn: () => getSongAlbums(song.id),
  });

  return (
    <div className="w-full mx-auto ">
      <div className="flex gap-6">
        <Avatar className="h-28 w-28 rounded-md border-2 border-gray-200">
          {song.song_cover ? (
            <AvatarImage
              src={SERVER_BASE_URL + song.song_cover}
              alt={song.title}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gray-100">
              <Play className="h-6 w-6 text-gray-500" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{song.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-gray-700">
            <span>By {song.artist_name}</span>
          </div>
          {song.genre && (
            <Badge variant="secondary" className="mt-2">
              {song.genre}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 mb-2">
        <h2>Albums containing this song:</h2>
      </div>

      <Table>
        <TableBody>
          {Array.isArray(albums) && albums.length > 0 ? (
            albums.map((album) => (
              <TableRow key={album.id}>
                <TableCell className="flex items-center gap-2 py-4">
                  <Avatar className="h-10 w-10 rounded-sm">
                    {album.album_cover ? (
                      <>
                        <AvatarImage
                          src={SERVER_BASE_URL + album.album_cover}
                          alt={album.album_name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          <Disc className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>
                        <Disc className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{album.album_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {album.artist_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {album.genre && (
                    <Badge variant="secondary">{album.genre}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(album.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                <div className="text-gray-500 flex flex-col items-center">
                  <Music2 className="h-6 w-6 mb-2" />
                  No albums found for this song.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
