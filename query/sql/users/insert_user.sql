INSERT INTO users (
  email, password, first_name, last_name, role, phone, gender, address, created_at, updated_at
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
RETURNING *;