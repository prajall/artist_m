"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Disc, Music2, Play, User } from "lucide-react";

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:8000";

export function AlbumDetail({ album }: { album: any }) {
  const getAlbumSongs = async (albumId: number) => {
    const res = await apiRequest.get(`/album/${albumId}/songs/`);
    console.log(res.data?.data);
    return res.data?.data;
  };

  const { data: songs } = useQuery({
    queryKey: ["album-songs", album.id],
    queryFn: () => getAlbumSongs(album.id),
  });

  return (
    <div className="w-full mx-auto ">
      <div className="flex gap-6">
        <Avatar className="h-28 w-28 rounded-md border-2 border-gray-200">
          {album.album_cover ? (
            <AvatarImage
              src={SERVER_BASE_URL + album.album_cover}
              alt={album.album_name}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gray-100">
              <Disc className="h-6 w-6 text-gray-500" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {album.album_name}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4" />
            <span>{album.artist_name}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Album ID: {album.id}</p>
        </div>
      </div>

      <div className="mt-6 mb-2">
        <h2 className=" ">Songs in this album:</h2>
      </div>

      <Table>
        <TableBody>
          {Array.isArray(songs) && songs.length > 0 ? (
            songs.map((song) => (
              <TableRow key={song.id}>
                <TableCell className="flex items-center gap-2 py-4">
                  <Avatar className="h-10 w-10 rounded-sm">
                    {song.song_cover ? (
                      <>
                        <AvatarImage
                          src={SERVER_BASE_URL + song.song_cover}
                          alt={song.title}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          <Play className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>
                        <Play className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {song.artist_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {song.genre && (
                    <Badge variant="secondary">{song.genre}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(song.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                <div className="text-gray-500 flex flex-col items-center">
                  <Music2 className="h-6 w-6 mb-2" />
                  No songs found for this album.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
