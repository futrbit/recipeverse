import os
import logging
import secrets
from datetime import timedelta, datetime, timezone
import json

from flask import (
    Flask, request, jsonify, redirect, url_for, flash, session
)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import (
    LoginManager, login_user, login_required, current_user, logout_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from authlib.integrations.flask_client import OAuth
import openai
import stripe
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://recipeverse-frontend.onrender.com").strip()
print(f"Using FRONTEND_URL: {repr(FRONTEND_URL)}")

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Build Firebase credentials dict from environment variables
cred_dict = {
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_CERT_URL"),
    "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN"),
}

try:
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    db_firestore = firestore.client()
    logger.info("Firebase Admin initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin: {e}")
    raise

app = Flask(__name__, instance_relative_config=True)

# Enable CORS for frontend and localhost dev
CORS(app, supports_credentials=True, origins=[
    FRONTEND_URL,
    "http://localhost:5173",
])

# Secret key for session management
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# OAuth setup for Google Login
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# Stripe & OpenAI setup
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
openai.api_key = os.environ.get("OPENAI_API_KEY")

# ---------------------------
# Database Models
# ---------------------------

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    credits = db.Column(db.Integer, default=3)
    subscription_status = db.Column(db.String(20), default='free')
    last_reset = db.Column(db.DateTime)
    api_calls = db.Column(db.Integer, default=0)
    stripe_customer_id = db.Column(db.String(100))
    subscription_id = db.Column(db.String(100))

    def get_id(self):
        return str(self.id)

class Recipe(db.Model):
    __tablename__ = 'recipe'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(200))
    cuisine = db.Column(db.String(50))
    dietary = db.Column(db.String(100))
    ingredients = db.Column(db.Text)
    instructions = db.Column(db.Text)
    nutrition = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------------------
# Flask-Login User Loader
# ---------------------------

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except Exception as e:
        logger.error(f"Error loading user: {e}")
        return None

# ---------------------------
# Routes
# ---------------------------

@app.route('/')
def root():
    # Redirect to frontend app (React/Vue) landing page
    return redirect(FRONTEND_URL)

# Google OAuth login route
@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    try:
        token = google.authorize_access_token()
    except Exception as e:
        logger.error(f"OAuth token error: {e}")
        flash("Authentication failed.")
        return redirect(FRONTEND_URL)

    userinfo = google.parse_id_token(token)
    if not userinfo:
        flash("Failed to get user info from Google.")
        return redirect(FRONTEND_URL)

    email = userinfo.get('email')
    username = userinfo.get('name') or email.split('@')[0]

    user = User.query.filter_by(email=email).first()
    if not user:
        # Create new user with random password (Google OAuth, so not used)
        user = User(
            username=username,
            email=email,
            password=generate_password_hash(secrets.token_urlsafe(16)),
            credits=3,
            subscription_status='free',
        )
        db.session.add(user)
        db.session.commit()

    login_user(user)
    session.permanent = True  # Use permanent session to respect PERMANENT_SESSION_LIFETIME
    return redirect(FRONTEND_URL + '/dashboard')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(FRONTEND_URL)

# Protected route example
@app.route('/user')
@login_required
def get_user():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "credits": current_user.credits,
        "subscription_status": current_user.subscription_status
    })

# Generate recipe using OpenAI GPT
@app.route('/generate_recipe', methods=['POST'])
@login_required
def generate_recipe():
    data = request.json
    cuisine = data.get('cuisine', '')
    dietary = data.get('dietary', '')
    ingredients = data.get('ingredients', '')

    prompt = (
        f"Create a detailed recipe for {cuisine} cuisine "
        f"that fits the dietary restrictions: {dietary}. "
        f"Use these ingredients: {ingredients}. "
        "Provide title, ingredients list, instructions, and nutrition info."
    )

    if current_user.credits <= 0:
        return jsonify({"error": "Insufficient credits"}), 403

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0.7,
            max_tokens=1000,
            n=1,
            stop=None,
        )
        recipe_text = response.choices[0].text.strip()
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        return jsonify({"error": "Failed to generate recipe"}), 500

    # Deduct a credit
    current_user.credits -= 1
    current_user.api_calls += 1
    db.session.commit()

    return jsonify({"recipe": recipe_text})

# Save generated recipe to Firebase Firestore
@app.route('/recipes/save', methods=['POST'])
@login_required
def save_recipe_to_firebase():
    data = request.json
    if not data:
        return jsonify({"error": "Missing data"}), 400

    try:
        doc_ref = db_firestore.collection("users").document(current_user.email).collection("recipes").document()
        data['timestamp'] = datetime.now(timezone.utc).isoformat()
        doc_ref.set(data)
    except Exception as e:
        logger.error(f"Error saving recipe to Firebase: {e}")
        return jsonify({"error": "Failed to save recipe"}), 500

    return jsonify({"message": "Recipe saved successfully"}), 200

# Fetch recipes saved in Firebase Firestore
@app.route('/recipes', methods=['GET'])
@login_required
def fetch_user_recipes():
    try:
        recipes_ref = db_firestore.collection("users").document(current_user.email).collection("recipes")
        docs = recipes_ref.stream()
        recipes = [doc.to_dict() for doc in docs]
        return jsonify(recipes), 200
    except Exception as e:
        logger.error(f"Error fetching recipes from Firebase: {e}")
        return jsonify({"error": "Failed to fetch recipes"}), 500

# Stripe webhook for subscription updates
@app.route('/stripe/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        logger.error(f"Invalid Stripe webhook payload: {e}")
        return '', 400
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid Stripe signature: {e}")
        return '', 400

    # Handle the event
    if event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        status = subscription.get('status')

        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        if user:
            user.subscription_status = status
            db.session.commit()

    return '', 200

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200

# Run app
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
