 SELECT count(*) as total_count
    FROM SONGS s
    JOIN Artists a ON s.artist_id = a.id
    WHERE (%(artist_id)s IS NULL OR s.artist_id = %(artist_id)s)
      AND (%(manager_id)s IS NULL OR a.manager_id = %(manager_id)s)
