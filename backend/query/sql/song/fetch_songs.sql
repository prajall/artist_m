SELECT  s.id, 
        s.title,
        s.artist_id,
        s.genre,
        s.song_cover,
        a.artist_name,
        s.created_at,
        s.updated_at 
FROM SONGS s
JOIN Artists a ON s.artist_id = a.id
WHERE (%(artist_id)s IS NULL OR s.artist_id = %(artist_id)s)
  AND (%(manager_id)s IS NULL OR a.manager_id = %(manager_id)s)
LIMIT %(limit)s OFFSET %(offset)s;