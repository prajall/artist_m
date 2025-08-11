SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    phone,
    gender,
    address,
    dob,
    profile_image
FROM Users
WHERE id = %s