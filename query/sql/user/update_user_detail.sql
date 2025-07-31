UPDATE Users
SET email = %s,
    first_name = %s,
    last_name = %s,
    role = %s,
    phone = %s,
    gender = %s,
    address = %s,
    dob = %s,
    updated_at = NOW()
WHERE id = %s