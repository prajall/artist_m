SELECT 
    id, email, first_name, last_name, role, phone, gender, address, dob, profile_image
FROM Users
WHERE 
    (%(search)s IS NULL OR 
     first_name ILIKE %(search_pattern)s OR 
     last_name ILIKE %(search_pattern)s OR 
     email ILIKE %(search_pattern)s)
    AND (%(role)s IS NULL OR role = %(role)s)
ORDER BY id 
LIMIT %(limit)s OFFSET %(offset)s;