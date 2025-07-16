import os
import logging
from datetime import timedelta, datetime, timezone
from flask import Flask, request, jsonify, redirect, url_for, flash, session, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from authlib.integrations.flask_client import OAuth
import openai
from dotenv import load_dotenv
import secrets
import stripe

# Load environment variables
load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))
frontend_url = os.environ.get("FRONTEND_URL", "https://recipeverse-frontend.onrender.com").strip()
print(f"Using FRONTEND_URL: {repr(frontend_url)}")

app = Flask(__name__, instance_relative_config=True)

# === CORS Setup ===
CORS(app, supports_credentials=True, origins=[
    frontend_url,
    "http://localhost:5173"  # local dev frontend
])

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    credits = db.Column(db.Integer, default=3)
    subscription_status = db.Column(db.String(20), default='free')
    last_reset = db.Column(db.DateTime)  # <== Changed here from last_credit_reset
    api_calls = db.Column(db.Integer, default=0)
    stripe_customer_id = db.Column(db.String(100))
    subscription_id = db.Column(db.String(100))

    def get_id(self):
        return str(self.id)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(200))
    cuisine = db.Column(db.String(50))
    dietary = db.Column(db.String(100))
    ingredients = db.Column(db.Text)
    instructions = db.Column(db.Text)
    nutrition = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    try:
        user = User.query.get(int(user_id))
        if user:
            logger.debug(f"User loaded: {user.username}")
        return user
    except Exception as e:
        logger.error(f"Error loading user: {e}")
        return None

# Frontend serving
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist_dir = os.path.join(basedir, '..', 'frontend', 'dist')
    full_path = os.path.join(dist_dir, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return serve_frontend('')

# API routes
@app.route('/api/user-info')
@login_required
def user_info():
    return jsonify({
        "username": current_user.username,
        "credits": current_user.credits,
        "subscription_status": current_user.subscription_status,
        "last_reset": current_user.last_reset.isoformat() if current_user.last_reset else None,  # changed here
        "api_calls": current_user.api_calls,
        "stripe_customer_id": current_user.stripe_customer_id
    })

@app.route('/api/user_credits')
@login_required
def get_credits():
    return jsonify({
        "credits": current_user.credits,
        "subscription_status": current_user.subscription_status,
        "username": current_user.username,
        "last_reset": current_user.last_reset.isoformat() if current_user.last_reset else None,  # changed here
        "api_calls": current_user.api_calls
    })

@app.route('/pricing', methods=['GET'])
@login_required
def pricing():
    pricing_plans = [
        {'plan': 'Free', 'price': 0, 'credits': 3, 'features': ['3 daily recipes', 'Basic support']},
        {'plan': 'Premium Monthly', 'price': 5.99, 'credits': 'Unlimited', 'features': ['Unlimited recipes', 'Priority support']},
        {'plan': 'Premium Yearly', 'price': 49.99, 'credits': 'Unlimited', 'features': ['Unlimited recipes', 'Priority support', '10% discount']}
    ]
    return jsonify({
        'plans': pricing_plans,
        'user': {
            'username': current_user.username,
            'subscription_status': current_user.subscription_status,
            'stripe_customer_id': current_user.stripe_customer_id
        }
    })

@app.route('/stripe/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    try:
        data = request.get_json() or {}
        plan = data.get('plan')
        price_ids = {
            'Premium Monthly': os.environ.get('STRIPE_MONTHLY_PRICE_ID'),
            'Premium Yearly': os.environ.get('STRIPE_YEARLY_PRICE_ID')
        }
        if plan not in price_ids or not price_ids[plan]:
            return jsonify({'error': 'Invalid plan selected.'}), 400

        session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=['card'],
            line_items=[{
                'price': price_ids[plan],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/pricing",
        )
        return jsonify({'id': session.id})
    except Exception as e:
        logger.error(f'Stripe checkout error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/stripe/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error(f'Webhook error: {e}')
        return jsonify({'error': 'Invalid webhook'}), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        user = User.query.filter_by(email=session.get('customer_email')).first()
        if user:
            user.stripe_customer_id = customer_id
            user.subscription_id = subscription_id
            user.subscription_status = 'premium'
            user.credits = 9999
            db.session.commit()
            logger.info(f'User {user.username} upgraded to premium')
    elif event['type'] == 'customer.subscription.deleted':
        customer_id = event['data']['object']['customer']
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        if user:
            user.subscription_status = 'free'
            user.credits = 3
            user.subscription_id = None
            db.session.commit()
            logger.info(f'User {user.username} downgraded to free')

    return jsonify({'status': 'success'}), 200

@app.route('/generate', methods=['POST'])
@login_required
def generate_recipe():
    user = User.query.get(current_user.id)
    if not user:
        return jsonify({"error": "user_not_found", "message": "User not found."}), 404

    if user.subscription_status == 'free':
        now = datetime.now(timezone.utc)
        last_reset_date = user.last_reset.date() if user.last_reset else None  # changed here
        if last_reset_date is None or last_reset_date < now.date():
            try:
                user.credits = 3
                user.last_reset = now  # changed here
                db.session.commit()
                logger.info(f"Credits reset to 3 for user {user.username} on {now.date()}")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Failed to reset credits: {e}")
                return jsonify({"error": "db_error", "message": "Failed to reset credits."}), 500

        if user.credits <= 0:
            return jsonify({
                "error": "no_credits",
                "message": "You have no credits left. Upgrade to Premium for unlimited recipes!"
            }), 403

        try:
            user.credits -= 1
            user.api_calls += 1
            db.session.commit()
            logger.info(f"Credit deducted for {user.username}. Remaining: {user.credits}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Credit decrement failed: {e}")
            return jsonify({"error": "db_error", "message": "Failed to update credits."}), 500

    data = request.get_json() or {}
    ingredients = data.get('ingredients', [])
    dietary = data.get('dietary', [])
    spice_level = data.get('spice_level', 3)
    cook_time = data.get('cook_time', 30)
    difficulty = data.get('difficulty', 'easy')
    portions = data.get('portions', 2)
    cuisine = data.get('cuisine', 'Random')

    if not ingredients:
        if user.subscription_status != 'premium':
            try:
                user.credits += 1
                db.session.commit()
            except:
                pass
        return jsonify({"error": "invalid_input", "message": "At least one ingredient is required."}), 400

    prompt = (
        f"Generate an easy {cuisine} recipe for {portions} portions with: {', '.join(ingredients)}. "
        f"Dietary: {', '.join(dietary) or 'None'}, spice: {spice_level}/5, time: {cook_time} min, difficulty: {difficulty}. "
        f"Include title, ingredients w/ amounts, steps, and per-serving nutrition."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful recipe assistant. Format recipes with a title, ingredients with quantities, instructions, and nutrition."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.8,
        )
        recipe_text = response['choices'][0]['message']['content']

        recipe = Recipe(
            user_id=user.id,
            title="Generated Recipe",
            cuisine=cuisine if cuisine != 'Random' else None,
            dietary=', '.join(dietary) if dietary else None,
            ingredients=', '.join(ingredients),
            instructions=recipe_text,
            nutrition=None,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(recipe)
        db.session.commit()

        return jsonify({"recipe_text": recipe_text, "credits": user.credits, "api_calls": user.api_calls})

    except Exception as e:
        db.session.rollback()
        if user.subscription_status != 'premium':
            try:
                user.credits += 1
                db.session.commit()
            except:
                pass
        logger.error(f"OpenAI API error: {e}")
        return jsonify({"error": "openai_error", "message": str(e)}), 500

@app.route('/cookbook', methods=['GET'])
@login_required
def cookbook():
    recipes = Recipe.query.filter_by(user_id=current_user.id).order_by(Recipe.timestamp.desc()).all()
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'cuisine': r.cuisine,
        'dietary': r.dietary,
        'ingredients': r.ingredients,
        'instructions': r.instructions,
        'nutrition': r.nutrition,
        'timestamp': r.timestamp.isoformat()
    } for r in recipes])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect('/dashboard')

    if request.method == 'POST':
        identifier = request.form.get('identifier')
        password = request.form.get('password')
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect('/dashboard')
        else:
            flash('Invalid credentials', 'error')
            return redirect('/landing')

    return redirect('/landing')

@app.route('/google/login')
def google_login():
    nonce = secrets.token_urlsafe(16)
    session['nonce'] = nonce
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        userinfo = google.parse_id_token(token, nonce=session.get('nonce'))
        if not userinfo:
            flash('Failed to get user info from Google.', 'error')
            return redirect('/landing')

        user = User.query.filter_by(email=userinfo['email']).first()
        if not user:
            user = User(
                username=userinfo['name'],
                email=userinfo['email'],
                password=generate_password_hash(secrets.token_urlsafe(16)),
                subscription_status='free',
                credits=3,
                api_calls=0,
                last_reset=None  # optionally initialize last_reset here
            )
            db.session.add(user)
            db.session.commit()

        login_user(user)
        return redirect('/dashboard')
    except Exception as e:
        logger.error(f"Google login error: {e}")
        flash('Authentication failed.', 'error')
        return redirect('/landing')

@app.route('/signup', methods=['POST'])
def signup():
    identifier = request.form.get('identifier')
    password = request.form.get('password')

    # Validate input presence
    if not identifier or not password:
        flash('Please provide both username/email and password', 'error')
        return redirect('/landing')

    # Check if user already exists by username or email
    existing_user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if existing_user:
        flash('User already exists', 'error')
        return redirect('/landing')

    # Hash the password securely
    hashed_pw = generate_password_hash(password)

    # Create new user with non-null username and email
    user = User(
        username=identifier,
        email=identifier,
        password=hashed_pw,
        subscription_status='free',
        credits=3,
        api_calls=0,
        last_reset=None  # optionally initialize last_reset here
    )
    db.session.add(user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        flash('Failed to create user, please try again.', 'error')
        # Log the error if you want: logger.error(f"Signup DB error: {e}")
        return redirect('/landing')

    # Log user in immediately after successful signup
    login_user(user)
    return redirect('/dashboard')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/landing')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
