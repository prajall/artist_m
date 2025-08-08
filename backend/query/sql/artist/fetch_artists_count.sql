SELECT COUNT(*) AS total_artists
FROM Artists
where (%(manager_id)s IS NULL OR Artists.manager_id = %(manager_id)s)
