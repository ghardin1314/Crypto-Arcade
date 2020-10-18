from flask_api import FlaskAPI
from flask_sqlalchemy import SQLAlchemy

# local import
from instance.config import app_config
from flask_cors import CORS

import os

db = SQLAlchemy()


# manager = Manager(app)

def create_app(config_name):
    app = FlaskAPI(__name__, instance_relative_config=True)
    CORS(app)
    app.config.from_object(app_config[config_name])
    # app.config.from_pyfile('config.py')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    from .web3auth import auth_blueprint
    app.register_blueprint(auth_blueprint)

    return app