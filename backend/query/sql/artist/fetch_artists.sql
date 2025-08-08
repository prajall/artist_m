SELECT 
    Artists.id as id,
    Artists.artist_name,
    Artists.first_release_year,
    Artists.created_at,
    Artists.manager_id,

    Managers.first_name as manager_first_name,
    Managers.last_name as manager_last_name,
    Managers.email as manager_email,

    Users.id as user_id,
    Users.email,
    Users.first_name,
    Users.last_name,
    Users.email,
    Users.phone,
    Users.gender,
    Users.address,
    Users.profile_image
 
FROM Artists
JOIN Users on Artists.user_id = Users.id
JOIN Users as Managers on Artists.manager_id = Managers.id
WHERE (%(manager_id)s IS NULL OR Artists.manager_id = %(manager_id)s)
AND Users.role = 'artist'
LIMIT %(limit)s OFFSET %(offset)s;