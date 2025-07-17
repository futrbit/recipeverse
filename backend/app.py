import os
import logging
import json
import secrets
from datetime import timedelta, datetime

from flask import (
    Flask, request, jsonify, redirect, url_for, flash, session
)
from flask_cors import CORS
from flask_login import (
    LoginManager, login_user, login_required, current_user, logout_user, UserMixin
)
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Config
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173").strip()
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Setup CORS
CORS(app, supports_credentials=True, origins=[frontend_url, "http://localhost:5173"])

# Firebase credentials from environment variables split (see your last setup)
cred_dict = {
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.environ.get("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_CERT_URL"),
    "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN"),
}
cred = credentials.Certificate(cred_dict)
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()

# Flask-Login setup
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# User class for flask-login (using session for simplicity)
class User(UserMixin):
    def __init__(self, id_, email, name):
        self.id = id_
        self.email = email
        self.name = name

# Store users in-memory for this example (replace with DB in prod)
users = {}

@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

# Routes

@app.route('/')
@login_required
def index():
    return f"Hello, {current_user.name}! You're logged in."

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    try:
        token = google.authorize_access_token()
        user_info = google.parse_id_token(token)
        if not user_info:
            return "Failed to fetch user info from Google.", 400
        
        user_id = user_info['sub']
        user_email = user_info['email']
        user_name = user_info.get('name', 'No Name')

        # Store user in memory (replace with DB save)
        user = User(user_id, user_email, user_name)
        users[user_id] = user
        
        login_user(user)
        return redirect(url_for('index'))
    except Exception as e:
        logging.error(f"OAuth authorization error: {e}")
        return "Authorization failed.", 400

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

