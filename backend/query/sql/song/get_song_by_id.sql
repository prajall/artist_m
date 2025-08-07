SELECT 
    songs.id, 
    songs.artist_id, 
    songs.album_name, 
    songs.genre, 
    songs.song_cover,
    songs.song_link, 
    songs.title, 
    a.artist_name, 
    a.id AS artist_id, 
    u.id AS user_id,
    songs.created_at, 
    songs.updated_at
FROM songs
JOIN Artists a ON songs.artist_id = a.id
JOIN Users u ON a.user_id = u.id
WHERE songs.id = %(id)s;
