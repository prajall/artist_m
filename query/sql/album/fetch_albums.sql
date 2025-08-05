SELECT  albums.id, album_name, album_cover, artists.artist_name, artist_id 
FROM Albums
JOIN Artists on Albums.artist_id = Artists.id
WHERE (%(artist_id)s IS NULL OR Albums.artist_id = %(artist_id)s)
LIMIT %(limit)s OFFSET %(offset)s