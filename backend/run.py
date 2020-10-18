from dotenv import load_dotenv
load_dotenv()

import os

from app import create_app,  db
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

config_name = os.getenv('APP_SETTINGS') # config_name = "development"
app = create_app(config_name)
migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run(host= '0.0.0.0')