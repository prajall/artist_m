select 
    Albums.id, 
    Albums.album_name, 
    Albums.album_cover, 
    Artists.artist_name, 
    Artists.id AS artist_id, 
    Artists.manager_id ,
    Users.id AS user_id
from Albums 
JOIN Artists ON Albums.artist_id = Artists.id
JOIN Users ON Artists.user_id = Users.id
WHERE Albums.id = %(album_id)s