SELECT 
id, email, first_name, last_name, role, phone, gender, address, dob, profile_image
FROM Users
order by id 
LIMIT %(limit)s OFFSET %(offset)s;