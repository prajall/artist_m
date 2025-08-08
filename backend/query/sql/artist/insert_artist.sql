
INSERT INTO Artists (
    user_id, artist_name, manager_id, first_release_year, created_at, updated_at
)
VALUES (%(user_id)s, %(artist_name)s, %(manager_id)s, %(first_release_year)s, NOW(), NOW())
RETURNING *;
