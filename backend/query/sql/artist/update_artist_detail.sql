UPDATE Artists
SET artist_name = %(artist_name)s,
    manager_id = %(manager_id)s,
    first_release_year = %(first_release_year)s
WHERE id = %(id)s;