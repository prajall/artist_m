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
def fetch_all_dict(path=None,query=None,params=None):
    try:
        if not path and not query:
            raise ValueError("Either 'path' or 'query' must be provided.")
            
        if not query:
            query = load_sql(path)
        
        params = params or {}

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            if cursor.rowcount == 0:
                return []
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]

    except Exception as e:
        print("Error fetching data:", e)
        return []
    
def fetch_many_dict(path=None,query=None,params=None,limit=12, page=1):
    try:
        if not path and not query:
            raise ValueError("Either 'path' or 'query' must be provided.")
            
        if not query:
            query = load_sql(path)

        params = params or {}


        params['limit'] = limit
        params['offset'] = (page - 1) * limit
        print("query",query)
        print("params",params)

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            if cursor.rowcount == 0:
                return []
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchmany(limit)
            return [dict(zip(columns, row)) for row in rows]

    except Exception as e:
        print("Error fetching data:", e)
        return []

def fetch_one(path=None,params=None):
    try:
        query = load_sql(path)

        with connection.cursor() as cursor:
            cursor.execute(query,params)
            if cursor.rowcount == 0:
                return None
            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            print("columns",columns)
            print("row",row)
            return dict(zip(columns, row))
    except Exception as e:
        print("Error fetching data:", e)
        return None
    
def execute_sql(path=None, params=None, query=None,fetch_one=False,fetch_all_dict=False):
    try:
        if not path and not query:
            raise ValueError("Either 'path' or 'query' must be provided.")
            
        if not query:
            query = load_sql(path)

        print("query: ",query)
        
        with connection.cursor() as cursor:
            cursor.execute(query,params)
            if fetch_one:
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()
                print("row in fetchone",row)
                return dict(zip(columns, row)) or None
            if fetch_all_dict:
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                print("row in fetchone",rows)
                return [dict(zip(columns, row)) for row in rows] or None
            return cursor.rowcount
    except Exception as e:
        print("Error executing query:", e)
        return None
