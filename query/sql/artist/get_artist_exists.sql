SELECT EXISTS (
    SELECT 1 from Artists where user_id = %s
)