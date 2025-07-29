-- Fetch all artists
SELECT 
    Artists.id as artist_id,
    Artists.artist_name,
    Artists.first_release_year,
    Artists.created_at,
    Users.id as user_id,
    Users.email,
    Users.first_name,
    Users.last_name,
    Users.phone,
    Users.gender,
    Users.address
 
FROM Artists
JOIN Users on Artists.user_id = Users.id
where Users.role = 'artist';