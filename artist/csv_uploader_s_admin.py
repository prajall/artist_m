import csv
import io
from query.sql.utils import fetch_one, execute_sql, fetch_many_dict, fetch_all_dict
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

from .serializers import UserSerializer


def user_exists(email):
    return fetch_one("user/get_user_by_email.sql", [email])


def s_admin_upload_artists(file):
    file.seek(0)
    text_io = io.TextIOWrapper(file, encoding='utf-8')

    header_line = text_io.readline().strip()
    headers = header_line.split(',')

    required_headers = {"email","password","first_name","last_name","dob","gender","phone","address", "artist_name", "first_release_year"}
    missing_headers = required_headers - set(headers)

    if missing_headers:
        raise ValueError(f"Missing required headers: {', '.join(missing_headers)}")

    text_io.seek(0)
    reader = csv.DictReader(text_io)
    artist_user_datas = list(reader)


    print("Artist_data",artist_user_datas)

    valid_user_artist_datas,user_query_values = bulk_data_validation(artist_user_datas)
    
    print("Valid Artists",valid_user_artist_datas)

    query = f"""
        INSERT INTO users (email, password, first_name, last_name, dob, gender, phone, address, role,created_at, updated_at)
        VALUES {",".join(user_query_values)}
        RETURNING *
        """

    new_users = execute_sql(query=query, fetch_all_dict=True)
    
    email_to_user_dict = {user['email']: user for user in new_users}
    
    artists = []
    for user_artist_data in valid_user_artist_datas:
        artist={}
        new_user = email_to_user_dict[user_artist_data['email']]
        artist['user_id'] = new_user['id']
        artist['artist_name'] = user_artist_data['artist_name']
        artist['manager_id'] = user_artist_data['manager_id']
        artist['first_release_year'] = user_artist_data['first_release_year']

        artists.append(artist)

    query = f"""
    INSERT INTO Artists (user_id, artist_name, manager_id, first_release_year, created_at, updated_at)
    VALUES {",".join([f"({artist['user_id']}, '{artist['artist_name']}', {artist['manager_id']}, '{artist['first_release_year']}-01-01', NOW(), NOW())" for artist in artists])}
    RETURNING *
    """
    
    print("Artist query",query)
    new_artists = execute_sql(query=query, fetch_all_dict=True)
    return new_artists


def bulk_data_validation(artist_user_datas):

    emails = [row['email'].strip() for row in artist_user_datas]

    print("Emails", emails)

    # Fetch all users with provided emails
    user_query = """
        SELECT id, email, role 
        FROM users 
        WHERE email = ANY(%s)
    """
    users_result = fetch_all_dict(query=user_query, params=[emails])
    
    # check email already exists
    errors=[]
    if users_result and len(users_result)>0:
        for user in users_result:
            errors.append(f"User with email '{user['email']}' already exists.")

        raise ValueError("\n".join(errors))
    
    #  check if manager exists
    managers = [row['manager_email'].strip() for row in artist_user_datas]
    manager_query = """
        SELECT id, email, role 
        FROM users 
        WHERE email = ANY(%s) AND role = 'artist_manager'
    """
    managers_result = fetch_all_dict(query=manager_query, params=[managers])
    manager_email_to_user = {user['email']: user for user in managers_result}
    
    
    print("managers_result",managers_result)

    errors = []
    user_query_values = []
    valid_user_artist_datas = []
    
    for data in artist_user_datas:
        print("manager_email=",data['manager_email'])
        data['manager_id'] = manager_email_to_user.get(data['manager_email'])['id']
        if not manager_email_to_user.get(data['manager_email']):
            errors.append(f"Manager with email '{data['manager_email']}' does not exist.")
            continue

        data['role'] = 'artist'
        
        serializer = UserSerializer(data = data)
       
        if not serializer.is_valid():
            
           errors.append(f"Data validation error for user email: {data['email']}")
           print("Validation error",serializer.errors)
        else :
            valid_user_artist_datas.append(data)
            user_query_values.append(f"('{data['email']}','{make_password(data['password'])}','{data['first_name']}','{data['last_name']}','{data['dob']}','{data['gender']}','{data['phone']}','{data['address']}','{data['role']}',NOW(),NOW())")

    if errors and len(errors)>0:
        raise ValueError("\n".join(errors))
    
    return (valid_user_artist_datas,user_query_values)

