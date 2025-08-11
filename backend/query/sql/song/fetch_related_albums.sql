select album_id              
from songs s
join album_song on s.id = album_song.song_id
where s.id = %(song_id)s;
