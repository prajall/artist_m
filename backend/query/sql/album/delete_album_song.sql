delete from album_song
where song_id = %(song_id)s 
and album_id = %(album_id)s;