select 
    albums.id as album_id,
    songs.id as song_id,
    users.id as user_id,
    users.role as user_role,
    album_song.id as id,artists.id as artist_id,
    artists.manager_id as manager_id
from album_song
join albums on album_song.album_id = albums.id
join songs on album_song.song_id = songs.id
join artists on albums.artist_id = artists.id
join users on artists.user_id = users.id
where album_song.song_id = %(song_id)s and album_song.album_id = %(album_id)s;