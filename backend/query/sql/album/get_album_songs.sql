select 
    album_song.id as id,
    album_song.album_id as album_id,
    album_song.song_id as song_id,
    songs.id as song_id,
    songs.title,
    songs.artist_id,
    songs.song_cover,
    songs.created_at,
    songs.updated_at,
    artists.artist_name,
    songs.genre
                       
from album_song 
join songs on album_song.song_id = songs.id 
join artists on songs.artist_id = artists.id
where album_song.album_id = %(album_id)s