# TRX-Arcade

start client:
cd client; npm run start

start server:
cd server; npx nodemon server.js

start Eth node:
truffle develop; migrate

start backend:
cd backend; python run.py

wipe db:
cd backend
python manage.py resetDB
python manage.py db upgrade
python manage.py db migrate

