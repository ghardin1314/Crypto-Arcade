from app import db
# from sqlalchemy.dialects.postgresql import JSON
from flask import current_app as app

import secrets
import datetime
import random
import jwt
from web3.auto import w3
from eth_account.messages import encode_defunct

from eth_utils import keccak


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    account = db.Column(db.String(255), unique=True, nullable=False)
    registered_on = registered_on = db.Column(db.DateTime, nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    nonce = db.Column(db.String(255), nullable=False, unique=True)

    def __init__(self, email, username, account, admin=False):
        self.email = email
        self.username = username
        self.account = account
        self.nonce = secrets.token_urlsafe()
        self.registered_on = datetime.datetime.now()
        self.admin = admin

    def __repr__(self):
        return '<username: {}>'.format(self.username)

    def signature_is_valid(self, signature):

        msg = "Authentication login request. Nonce: " + self.nonce

        message = encode_defunct(text=msg)

        account = w3.eth.account.recover_message(
            message, signature=signature)

        if account == self.account:
            self.update_nonce()
            return True

        else:
            self.update_nonce()
            return False

    def get_nonce(self):
        return self.nonce

    def update_nonce(self):
        self.nonce = secrets.token_urlsafe()
        self.save()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def generate_token(self, account, username):
        """
        Generates the Auth Token
        :return: string
        """
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30, seconds=0),
                'iat': datetime.datetime.utcnow(),
                'sub': account,
                'name': username,
                'rand': random.random()
            }
            return jwt.encode(
                payload,
                app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_token(auth_token):
        """
        Validates the auth token
        :param auth_token:
        :return: integer|string
        """
        try:
            payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'))
            is_blacklisted_token = BlacklistToken.check_blacklist(auth_token)
            if is_blacklisted_token:
                return 'Token blacklisted. Please log in again.'
            else:
                return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'


class BlacklistToken(db.Model):
    """
    Token Model for storing JWT tokens
    """
    __tablename__ = 'blacklist_tokens'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(500), unique=True, nullable=False)
    blacklisted_on = db.Column(db.DateTime, nullable=False)

    def __init__(self, token):
        self.token = token
        self.blacklisted_on = datetime.datetime.now()

    def __repr__(self):
        return '<id: token: {}'.format(self.token)

    @staticmethod
    def check_blacklist(auth_token):
        # check whether auth token has been blacklisted
        res = BlacklistToken.query.filter_by(token=str(auth_token)).first()
        if res:
            return True
        else:
            return False
