import os
import logging
from datetime import datetime, timezone
from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
import openai
import stripe
import secrets

# Load environment variables
load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))
frontend_url = os.environ.get("FRONTEND_URL", "https://recipeverse-frontend.onrender.com").strip()
print(f"Using FRONTEND_URL: {repr(frontend_url)}")

# Initialize Flask app
app = Flask(__name__, instance_relative_config=True)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))

# Enable CORS for frontend and local dev
CORS(app, supports_credentials=True, origins=[
    frontend_url,
    "http://localhost:5173",  # Vite dev server
])

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK with service account from env
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
db = firestore.client()

# Initialize OpenAI & Stripe
openai.api_key = os.environ.get("OPENAI_API_KEY")
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Helper to verify Firebase ID token in Authorization header
def verify_token():
    id_token = request.headers.get('Authorization')
    if not id_token or not id_token.startswith('Bearer '):
        return None, jsonify({"error": "No token provided"}), 401
    try:
        token = id_token.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token, None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None, jsonify({"error": "Invalid token"}), 401

# === Authentication Routes ===

@app.route('/api/login', methods=['POST'])
def firebase_login():
    try:
        id_token = request.json.get('token')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name', 'User')

        # Store/update user in Firestore
        user_ref = db.collection('users').document(uid)
        user_ref.set({
            "email": email,
            "name": name,
            "last_login": datetime.now(timezone.utc).isoformat()
        }, merge=True)

        return jsonify({"uid": uid, "email": email, "name": name})

    except Exception as e:
        logger.error(f"Login failed: {e}")
        return jsonify({"error": "Invalid token"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    # Stateless token auth - frontend just deletes token
    return jsonify({"message": "Logged out"})

@app.route('/api/user-info')
def user_info():
    decoded_token, error = verify_token()
    if error:
        return error
    uid = decoded_token['uid']
    user_ref = db.collection('users').document(uid)
    user = user_ref.get()
    user_data = user.to_dict() if user.exists else {
        'credits': 3,
        'subscription_status': 'free',
        'api_calls': 0,
        'last_credit_reset': None
    }
    return jsonify({
        "uid": uid,
        "email": decoded_token.get('email'),
        "name": decoded_token.get('name', 'User'),
        "credits": user_data.get('credits', 3),
        "subscription_status": user_data.get('subscription_status', 'free'),
        "last_credit_reset": user_data.get('last_credit_reset'),
        "api_calls": user_data.get('api_calls', 0),
        "stripe_customer_id": user_data.get('stripe_customer_id')
    })

@app.route('/api/user_credits')
def get_credits():
    decoded_token, error = verify_token()
    if error:
        return error
    uid = decoded_token['uid']
    user_ref = db.collection('users').document(uid)
    user = user_ref.get()
    user_data = user.to_dict() if user.exists else {
        'credits': 3,
        'subscription_status': 'free',
        'api_calls': 0,
        'last_credit_reset': None
    }
    return jsonify({
        "credits": user_data.get('credits', 3),
        "subscription_status": user_data.get('subscription_status', 'free'),
        "email": decoded_token.get('email'),
        "last_credit_reset": user_data.get('last_credit_reset'),
        "api_calls": user_data.get('api_calls', 0)
    })

# === Pricing Plans ===
@app.route('/pricing', methods=['GET'])
def pricing():
    decoded_token, error = verify_token()
    if error:
        return error
    uid = decoded_token['uid']
    user_ref = db.collection('users').document(uid)
    user = user_ref.get()
    user_data = user.to_dict() if user.exists else {}
    pricing_plans = [
        {'plan': 'Free', 'price': 0, 'credits': 3, 'features': ['3 daily recipes', 'Basic support']},
        {'plan': 'Premium Monthly', 'price': 5.99, 'credits': 'Unlimited', 'features': ['Unlimited recipes', 'Priority support']},
        {'plan': 'Premium Yearly', 'price': 49.99, 'credits': 'Unlimited', 'features': ['Unlimited recipes', 'Priority support', '10% discount']}
    ]
    return jsonify({
        'plans': pricing_plans,
        'user': {
            'email': decoded_token.get('email'),
            'subscription_status': user_data.get('subscription_status', 'free'),
            'stripe_customer_id': user_data.get('stripe_customer_id')
        }
    })

# === Stripe Checkout ===
@app.route('/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    decoded_token, error = verify_token()
    if error:
        return error
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
            customer_email=decoded_token['email'],
            payment_method_types=['card'],
            line_items=[{
                'price': price_ids[plan],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/pricing",
            metadata={'uid': decoded_token['uid']}
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
        session_data = event['data']['object']
        customer_id = session_data.get('customer')
        subscription_id = session_data.get('subscription')
        uid = session_data.get('metadata', {}).get('uid')
        if uid:
            user_ref = db.collection('users').document(uid)
            user_ref.set({
                'stripe_customer_id': customer_id,
                'subscription_id': subscription_id,
                'subscription_status': 'premium',
                'credits': 9999,
                'last_credit_reset': datetime.now(timezone.utc).isoformat()
            }, merge=True)
            logger.info(f'User {uid} upgraded to premium')

    elif event['type'] == 'customer.subscription.deleted':
        customer_id = event['data']['object']['customer']
        user_query = db.collection('users').where('stripe_customer_id', '==', customer_id).limit(1).stream()
        for user in user_query:
            user_ref = db.collection('users').document(user.id)
            user_ref.set({
                'subscription_status': 'free',
                'credits': 3,
                'subscription_id': None,
                'last_credit_reset': datetime.now(timezone.utc).isoformat()
            }, merge=True)
            logger.info(f'User {user.id} downgraded to free')

    return jsonify({'status': 'success'}), 200

# === Recipe Generation ===
@app.route('/generate', methods=['POST'])
def generate_recipe():
    decoded_token, error = verify_token()
    if error:
        return error
    uid = decoded_token['uid']
    user_ref = db.collection('users').document(uid)
    user = user_ref.get()
    user_data = user.to_dict() if user.exists else {
        'credits': 3,
        'subscription_status': 'free',
        'api_calls': 0,
        'last_credit_reset': None
    }

    # Credit reset daily logic for free users
    if user_data.get('subscription_status') == 'free':
        now = datetime.now(timezone.utc)
        last_reset = user_data.get('last_credit_reset')
        last_reset_date = datetime.fromisoformat(last_reset).date() if last_reset else None
        if last_reset_date is None or last_reset_date < now.date():
            user_data['credits'] = 3
            user_data['last_credit_reset'] = now.isoformat()
            user_ref.set(user_data, merge=True)
            logger.info(f"Credits reset to 3 for user {uid}")

        if user_data.get('credits', 0) <= 0:
            return jsonify({
                "error": "no_credits",
                "message": "You have no credits left. Upgrade to Premium for unlimited recipes!"
            }), 403

        user_data['credits'] -= 1
        user_data['api_calls'] = user_data.get('api_calls', 0) + 1
        user_ref.set(user_data, merge=True)
        logger.info(f"Credit deducted for {uid}. Remaining: {user_data['credits']}")

    data = request.get_json() or {}
    ingredients = data.get('ingredients', [])
    dietary = data.get('dietary', [])
    spice_level = data.get('spice_level', 3)
    cook_time = data.get('cook_time', 30)
    difficulty = data.get('difficulty', 'easy')
    portions = data.get('portions', 2)
    cuisine = data.get('cuisine', 'Random')

    if not ingredients:
        if user_data.get('subscription_status') != 'premium':
            user_data['credits'] += 1
            user_ref.set(user_data, merge=True)
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

        recipe_data = {
            'user_id': uid,
            'title': "Generated Recipe",
            'cuisine': cuisine if cuisine != 'Random' else None,
            'dietary': ', '.join(dietary) if dietary else None,
            'ingredients': ', '.join(ingredients),
            'instructions': recipe_text,
            'nutrition': None,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        db.collection('recipes').add(recipe_data)

        return jsonify({"recipe_text": recipe_text, "credits": user_data.get('credits', 3), "api_calls": user_data.get('api_calls', 0)})

    except Exception as e:
        if user_data.get('subscription_status') != 'premium':
            user_data['credits'] += 1
            user_ref.set(user_data, merge=True)
        logger.error(f"OpenAI error: {e}")
        return jsonify({"error": "openai_error", "message": str(e)}), 500

# === Cookbook: list recipes ===
@app.route('/cookbook', methods=['GET'])
def cookbook():
    decoded_token, error = verify_token()
    if error:
        return error
    uid = decoded_token['uid']
    recipes = db.collection('recipes').where('user_id', '==', uid).order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
    return jsonify([{
        'id': r.id,
        'title': r.to_dict().get('title'),
        'cuisine': r.to_dict().get('cuisine'),
        'dietary': r.to_dict().get('dietary'),
        'ingredients': r.to_dict().get('ingredients'),
        'instructions': r.to_dict().get('instructions'),
        'nutrition': r.to_dict().get('nutrition'),
        'timestamp': r.to_dict().get('timestamp')
    } for r in recipes])

# === Static frontend serving ===
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist_dir = os.path.join(basedir, '..', 'frontend', 'dist')
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')

# Run app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
