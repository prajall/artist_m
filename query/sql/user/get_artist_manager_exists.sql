SELECT EXISTS(
    SELECT 1 FROM Users
    WHERE role = 'artist_manager' AND id = %s
)