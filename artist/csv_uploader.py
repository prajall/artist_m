import csv
import io
from query.sql.utils import fetch_one, execute_sql, fetch_many_dict, fetch_all_dict
from rest_framework.response import Response


def user_exists(email):
    return fetch_one("user/get_user_by_email.sql", [email])


def upload_artists(file, manager_id):
    file.seek(0)
    text_io = io.TextIOWrapper(file, encoding='utf-8')

    # Read the first line (header)
    header_line = text_io.readline().strip()
    headers = header_line.split(',')

    required_headers = {"email", "artist_name", "first_release_year"}
    missing_headers = required_headers - set(headers)

    if missing_headers:
        raise ValueError(f"Missing required headers: {', '.join(missing_headers)}")

    text_io.seek(0)
    reader = csv.DictReader(text_io)
    artist_datas = list(reader)
    errors = []
    query_values = []

    print(artist_datas)

    # for artist in artist_datas:
    #     email  = artist.get("email")
    #     artist_name = artist.get("artist_name")
    #     first_release_year = artist.get("first_release_year")

    #     if not email or not artist_name or not first_release_year:
    #         raise ValueError("Email, artist name, and first release year are required.")

    #     # user = user_exists(email)
    #     # if not user:
    #     #     print(f"User with email {email} does not exist.")
    #     #     errors.append(f"User with email {email} does not exist.")
    #     #     continue
        
    #     # query_values.append(f"('{user['id']}', '{artist_name}', '{first_release_year}-01-01','{manager_id}', NOW(), NOW())")
        
    
    # if errors and len(errors)>0:
    #     raise ValueError("\n".join(errors))

    bulk_data_validation(artist_datas)
    

    # query = f"""
    #     INSERT INTO artists (user_id, artist_name, first_release_year, manager_id, created_at, updated_at)
    #     VALUES {",".join(query_values)}
    #     RETURNING *
    #     """

    # result = execute_sql(query=query)
    # return result
    return 0


def bulk_data_validation(artists):

    emails = [row['email'] for row in artists]

    print("Emails", emails)
    
    user_query = """
        SELECT id, email, role 
        FROM users 
        WHERE email = ANY(%s)
    """
    users_result = fetch_all_dict(query=user_query, params=[emails])
    user_by_email = {user['email']: user for user in users_result}

    print("Fetch user with emails",users_result)
    print("user_by_email",user_by_email)


     # check artist exist for that email/user
    if users_result:
        user_ids = [user['id'] for user in users_result]
        existing_artists_query = """
            SELECT user_id 
            FROM artists 
            WHERE user_id = ANY(%s)
        """
        existing_artists_result = fetch_all_dict(query=existing_artists_query, params=[user_ids])
        existing_artist_user_ids = {row['user_id'] for row in existing_artists_result}
    else:
        existing_artist_user_ids = None

    errors = []
    for artist in artists:
        user = user_by_email.get(artist['email'])

        if not user:
            errors.append(f"User with email {artist['email']} does not exist.")
            continue
        
        if user['role'] != 'user':
            errors.append(f"User with email {artist['email']} is not a normal user.")
            continue

        if user['id'] in existing_artist_user_ids:
            errors.append(f"Artist with email {artist['email']} already exists.")
            continue

    if errors and len(errors)>0:
        raise ValueError("\n".join(errors))