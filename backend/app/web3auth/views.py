from . import auth_blueprint

from flask.views import MethodView
from flask import make_response, request, jsonify
from app.models import User

import secrets


class RegistrationView(MethodView):
    """ This class registers a new user"""

    def post(self):

        user = User.query.filter_by(account=request.data['account']).first()

        if not user:
            # try to register
            try:
                post_data = request.data

                account = post_data['account']
                email = post_data['email']
                username = post_data['username']

                user = User(account=account, email=email, username=username)

                user.save()

                access_token = user.generate_token(user.account, user.username)

                response = {
                    'message': 'You registered successfully.',
                    'access_token': access_token.decode(),
                    'account': user.account,
                    'username': user.username,
                }
                return make_response(jsonify(response)), 201
            except Exception as e:
                # An error occured, therefore return a string message containing the error
                response = {
                    'message': str(e)
                }
                return make_response(jsonify(response)), 401
        else:
            # There is an existing user. We don't want to register users twice
            # Return a message to the user telling them that they they already exist
            response = {
                'message': 'User already exists. Please login.'
            }
            return make_response(jsonify(response)), 202


class LoginView(MethodView):
    """This view handles user login and access token generation"""

    def post(self):
        """Handle POST request for this view  /auth/login"""

        try:
            user = User.query.filter_by(
                account=request.data['account']).first()

            # print(request.data['msgParams'])

            if not user:
                # User does not exist. Therefore, we return an error message
                response = {
                    'message': 'User does not exsist. Please register'
                }
                return make_response(jsonify(response)), 404

            if user and request.data['signature'] == '':
                # No signature attached, send back nonce for signature

                user.update_nonce()

                response = {
                    'message': 'No signature attached, please sign nonce',
                    'nonce': user.nonce,
                    'username': user.username,
                }

                return make_response(jsonify(response)), 201

            elif user.signature_is_valid(request.data['signature']):
                # Generate the access token. This will be used as the authorization header
                access_token = user.generate_token(user.account, user.username)
                if access_token:
                    response = {
                        'message': 'You logged in successfully.',
                        'access_token': access_token.decode(),
                        'account': user.account,
                        'username': user.username,
                    }
                    return make_response(jsonify(response)), 200
                else:
                    response = {
                        'message': 'Token generation error',
                    }
                    return make_response(jsonify(response)), 500
            else:
                # User does not exist. Therefore, we return an error message
                response = {
                    'message': 'Invalid email or signature, Please try again'
                }
                return make_response(jsonify(response)), 401

        except Exception as e:
            # Create a response containing an string error message
            response = {
                'message': str(e)
            }
            # Return a server error using the HTTP Error Code 500 (Internal Server Error)
            return make_response(jsonify(response)), 500


class HelloWorld(MethodView):
    def get(self):
        return{'hello': 'world'}


class TokenView(MethodView):

    def get(self):
        "Get Token Status"

        try:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                auth_token = auth_header.split(" ")[1]
            else:
                auth_token = ''

            if auth_token:
                resp = User.decode_token(auth_token)
                user = User.query.filter_by(account=resp).first()
                if user:
                    response = {
                        "account": user.account,
                        "username": user.username,
                    }
                    return make_response(jsonify(response)), 200

                else:
                    response = {
                        'message': resp
                    }
                    return make_response(jsonify(response)), 401

            else:
                responseObject = {
                    'message': 'Provide a valid auth token.'
                }
                return make_response(jsonify(responseObject)), 401

        except Exception as e:
            # Create a response containing an string error message
            response = {
                'message': str(e)
            }
            # Return a server error using the HTTP Error Code 500 (Internal Server Error)
            return make_response(jsonify(response)), 500

    def post(self):
        "Refresh token if still valid"
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                auth_token = auth_header.split(" ")[1]
            else:
                auth_token = ''

            if auth_token:
                resp = User.decode_token(auth_token)
                user = User.query.filter_by(account=resp).first()
                if user:
                    access_token = user.generate_token(
                        user.account, user.username)
                    response = {
                        'message': 'Token valid, returned refreshed token',
                        'access_token': access_token.decode(),
                    }
                    return make_response(jsonify(response)), 200

                else:
                    response = {
                        'message': resp
                    }
                    return make_response(jsonify(response)), 401

            else:
                responseObject = {
                    'message': 'Provide a valid auth token.'
                }
                return make_response(jsonify(responseObject)), 401

        except Exception as e:
            # Create a response containing an string error message
            response = {
                'message': str(e)
            }
            # Return a server error using the HTTP Error Code 500 (Internal Server Error)
            return make_response(jsonify(response)), 500


registration_view = RegistrationView.as_view('register_view')
login_view = LoginView.as_view('login_view')
token_view = TokenView.as_view('token_view')
test_view = HelloWorld.as_view('test_view')

auth_blueprint.add_url_rule('/', view_func=test_view, methods=['GET'])

auth_blueprint.add_url_rule(
    '/auth/register',
    view_func=registration_view,
    methods=['POST'])

# Define the rule for the registration url --->  /auth/login
# Then add the rule to the blueprint
auth_blueprint.add_url_rule(
    '/auth/login',
    view_func=login_view,
    methods=['POST']
)

auth_blueprint.add_url_rule(
    '/auth/token',
    view_func=token_view,
    methods=['POST', 'GET']
)
