import os
from django.db import connection

# read sql file and return the query
def load_sql(path):
    BASE_DIR = os.path.dirname(__file__)
    SQL_PATH = os.path.join(BASE_DIR,path)


    if not os.path.exists(SQL_PATH):
        raise FileNotFoundError(f"SQL file not found: {SQL_PATH}")

    with open(SQL_PATH,"r") as file:
        return file.read().strip()

# fetch from sql and return python serialized datas
def fetch_all_dict(path,params=None):
    query = load_sql(path)
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]
    
def fetch_many_dict(path,params,size=12):
    query = load_sql(path)

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchmany(size)
        return [dict(zip(columns, row)) for row in rows]
    
def fetch_one(path,params):
    query = load_sql(path)

    with connection.cursor() as cursor:
        cursor.execute(query,params)
        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()
        return dict(zip(columns, row))
    
def execute_sql(path, params, fetch_one=False):
    query = load_sql(path)

    with connection.cursor() as cursor:
        cursor.execute(query,params)
        # print(dir(cursor.description))
        if fetch_one:
            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            return dict(zip(columns, row))
        return cursor.rowcount
