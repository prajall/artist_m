SELECT id,first_name, last_name ,email,role, password 
from users 
WHERE email = %s