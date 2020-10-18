import unittest
import os
import json
from app import create_app, db

from web3 import Web3
from eth_account.messages import encode_defunct
from hexbytes import HexBytes


class AuthTestCase(unittest.TestCase):
    """This class represents the Auth test case"""

    def setUp(self):
        """Define test variables and initialzie app."""
        self.app = create_app(config_name="testing")
        self.client = self.app.test_client

        self.user_data = {
            'email': 'bob@test.com',
            'account': '0xd99824dB30C6A89E5aE0e5914ff695DCD79B9E80',
            'username': 'bob',
            'private_key': '557814f23afa8c78c2a5826588e8b059aecdaa4b7331add36a02faa0090fbf57',
            'signature': '',
        }

        self.w3 = Web3(Web3.WebsocketProvider('ws://127.0.0.1:8545'))

        with self.app.app_context():
            # create all tables
            db.session.close()
            db.drop_all()
            db.create_all()

    def tearDown(self):
        """teardown all initialized variables."""
        with self.app.app_context():
            # drop all tables
            db.session.remove()
            db.drop_all()

    def test_registration(self):
        """Test user registration works correcty."""
        res = self.client().post('/auth/register', data=self.user_data)
        # get the results returned in json format
        result = json.loads(res.data.decode())
        # assert that the request contains a success message and a 201 status code
        self.assertEqual(result['message'], "You registered successfully.")
        self.assertTrue(result['access_token'])
        self.assertEqual(res.status_code, 201)

    def test_already_registered_user(self):
        """Test can only register user once."""
        res = self.client().post('/auth/register', data=self.user_data)
        self.assertEqual(res.status_code, 201)
        second_res = self.client().post('/auth/register', data=self.user_data)
        self.assertEqual(second_res.status_code, 202)
        result = json.loads(second_res.data.decode())
        self.assertEqual(
            result['message'], "User already exists. Please login.")

    def test_w3(self):
        """Test makes sure connected to local Eth node"""
        self.assertTrue(self.w3.isConnected())

    def test_user_gets_nonce_with_signature(self):
        """Test registered user can get nonce for login"""
        res = self.client().post('/auth/register', data=self.user_data)
        self.assertEqual(res.status_code, 201)
        login_res = self.client().post('/auth/login', data=self.user_data)
        result = json.loads(login_res.data.decode())
        self.assertEqual(login_res.status_code, 201)
        self.assertEqual(
            result['message'], "No signature attached, please sign nonce")

    def test_user_gets_different_nonces(self):
        """Test registered user gets different nonce for each request"""

        # Register
        res = self.client().post('/auth/register', data=self.user_data)
        self.assertEqual(res.status_code, 201)

        # Get nonce with no signature
        login_res = self.client().post('/auth/login', data=self.user_data)
        result = json.loads(login_res.data.decode())
        nonce1 = result['nonce']

        login_res = self.client().post('/auth/login', data=self.user_data)
        result = json.loads(login_res.data.decode())
        nonce2 = result['nonce']

        self.assertNotEqual(nonce1, nonce2)

    # @unittest.SkipTest
    def test_user_login_signature(self):
        """Test registered user can login with signed message"""

        # Register
        res = self.client().post('/auth/register', data=self.user_data)
        self.assertEqual(res.status_code, 201)

        # Get nonce with no signature
        login_res = self.client().post('/auth/login', data=self.user_data)
        result = json.loads(login_res.data.decode())
        nonce = result['nonce']
        nonce = "Authentication login request. Nonce: " + nonce

        # sign nonce and send back signature
        message = encode_defunct(text=nonce)
        signed_message = self.w3.eth.account.sign_message(
            message, self.user_data['private_key'])

        # print(signed_message)

        payload = self.user_data
        # payload['signature'] = self.w3.toJSON(signed_message.signature)
        payload['signature'] = self.w3.toHex(signed_message.signature)

        recAccount = self.w3.eth.account.recover_message(message, signature=payload['signature'])

        login_res = self.client().post('/auth/login', data=payload)
        result = json.loads(login_res.data.decode())

        # print(result)

        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(
            result['message'], "You logged in successfully.")
        self.assertTrue(result['access_token'])

    def test_non_registered_user_login(self):
        """Test non registers users cannot login."""
        res = self.client().post('/auth/login', data=self.user_data)

        # get the results in json format
        result = json.loads(res.data.decode())

        # assert that this response must contain an error message
        # and an error status code 401(Unauthorized)
        self.assertEqual(res.status_code, 404)
        self.assertEqual(
            result['message'], "User does not exsist. Please register")

    def test_token_authentication(self):
        """Test token authentication works correcty."""
        res = self.client().post('/auth/register', data=self.user_data)
        result = json.loads(res.data.decode())
        access_token = result['access_token']

        headers={'Authorization': 'Bearer ' + access_token}

        resToken = self.client().get('/auth/token', headers=headers)
        resultToken = json.loads(resToken.data.decode())
        self.assertEqual(resToken.status_code, 200)
        self.assertEqual(resultToken['account'], result['account'])
        self.assertEqual(resultToken['username'], result['username'])

    
    def test_auto_token_renewal(self):
        """Test user registration works correcty."""
        res = self.client().post('/auth/register', data=self.user_data)
        result = json.loads(res.data.decode())
        access_token = result['access_token']

        headers={'Authorization': 'Bearer ' + access_token}

        resToken = self.client().post('/auth/token', headers=headers)
        resultToken = json.loads(resToken.data.decode())
        self.assertEqual(resToken.status_code, 200)
        self.assertNotEqual(access_token, resultToken['access_token'])



if __name__ == "__main__":
    unittest.main()
