SELECT * from SONGS
WHERE artist_id = %(artist_id)s
LIMIT %(limit)s OFFSET %(offset)s;
