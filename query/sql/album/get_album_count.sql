SELECT COUNT(*) AS total_count
FROM Albums
JOIN Artists  ON Albums.artist_id = Artists.id

WHERE (%(artist_id)s IS NULL OR Albums.artist_id = %(artist_id)s)
    AND (%(manager_id)s IS NULL OR Artists.manager_id = %(manager_id)s)
