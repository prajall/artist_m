INSERT INTO SONGS
(title, artist_id, genre, song_cover, created_at, updated_at)
VALUES (%(title)s, %(artist_id)s,%(genre)s, %(song_cover)s, NOW(), NOW())
RETURNING *;