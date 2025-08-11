select 
    albums.id as id,
    albums.album_name,
    albums.album_cover,
    albums.created_at,
    albums.updated_at,
    artists.artist_name
                       
from album_song 
join albums on album_song.album_id = albums.id 
join artists on albums.artist_id = artists.id
where album_song.song_id = %(song_id)s
                       