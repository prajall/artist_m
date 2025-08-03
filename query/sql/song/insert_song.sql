INSERT INTO SONGS
(title, artist_id, album_name, genre, song_cover, created_at, updated_at)
VALUES (%(title)s, %(artist_id)s, %(album_name)s,%(genre)s, %(song_cover)s, NOW(), NOW())
RETURNING *;