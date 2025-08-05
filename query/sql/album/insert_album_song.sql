INSERT INTO album_song (album_id, song_id)
VALUES (%(album_id)s, %(song_id)s)
RETURNING *;