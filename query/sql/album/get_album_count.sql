SELECT COUNT(*) AS total_albums
FROM Albums
WHERE (%(artist_id)s IS NULL OR Albums.artist_id = %(artist_id)s)
