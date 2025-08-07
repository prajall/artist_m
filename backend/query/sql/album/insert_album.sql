INSERT INTO albums (album_name, album_cover, artist_id, created_at, updated_at)
VALUES (%(album_name)s, %(album_cover)s, %(artist_id)s, NOW(), NOW())
RETURNING *;