SELECT 
    COUNT(*) AS total_artists
FROM Artists
WHERE Artists.manager_id = %(manager_id)s;
