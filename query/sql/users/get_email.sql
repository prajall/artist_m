-- Check if the email exists or not

SELECT EXISTS(
    SELECT 1 from users 
    WHERE email = %s
)

