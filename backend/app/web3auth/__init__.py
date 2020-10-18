from flask import Blueprint

# This instance of a Blueprint that represents the authentication blueprint
auth_blueprint = Blueprint('web3auth', __name__)

from . import views