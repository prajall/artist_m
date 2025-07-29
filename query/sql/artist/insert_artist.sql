
INSERT INTO Artists (
    user_id, artist_name, first_release_year, created_at, updated_at
)
VALUES (%s, %s, %s, NOW(), NOW())

RETURNING *;
