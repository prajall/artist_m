-- select count(*) as count from users

SELECT 
    count(*) as count
FROM Users
WHERE 
    (%(search)s IS NULL OR 
     first_name ILIKE %(search_pattern)s OR 
     last_name ILIKE %(search_pattern)s OR 
     email ILIKE %(search_pattern)s)
    AND (%(role)s IS NULL OR role = %(role)s);