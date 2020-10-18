#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

if [ "$APP_SETTINGS" = "development" ]
then
    echo "creating the databse tables..."
    python3 manage.py create_db
    echo "Tables created"
fi

exec "$@"