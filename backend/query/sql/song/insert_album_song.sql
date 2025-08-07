Insert into album_song (album_id, song_id) 
values (%(album_id)s, %(song_id)s)
returning *;