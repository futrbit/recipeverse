import os
import logging
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
from openai import OpenAI
import stripe
import secrets

# Load environment variables
load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://recipeverse-frontend.onrender.com").strip()

print(f"Using FRONTEND_URL: {repr(FRONTEND_URL)}")

# Initialize Flask app
app = Flask(__name__, instance_relative_config=True)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# Setup CORS with support for credentials and proper headers/methods
CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("RecipeVerseBackend")

# Validate and parse Firebase private key correctly
firebase_private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
if firebase_private_key:
    firebase_private_key = firebase_private_key.replace('\\n', '\n')
else:
    logger.error("Missing FIREBASE_PRIVATE_KEY environment variable.")

# Firebase credentials dictionary
cred_dict = {
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": firebase_private_key,
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_CERT_URL"),
    "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN"),
}

# Initialize Firebase
try:
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Initialized Firebase Admin SDK.")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
    raise e

# Initialize OpenAI client & Stripe keys
openai_api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

if not openai_api_key:
    logger.warning("OPENAI_API_KEY is not set.")

if not stripe.api_key:
    logger.warning("STRIPE_SECRET_KEY is not set.")

# --- Helper: Verify Firebase ID token ---
def verify_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, jsonify({"error": "Authorization header missing or invalid"}), 401
    token = auth_header.split('Bearer ')[1]
    try:
        decoded = auth.verify_id_token(token)
        return decoded, None
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        return None, jsonify({"error": "Invalid or expired token"}), 401

# === Routes ===

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json(force=True)
    id_token = data.get('token')
    if not id_token:
        return jsonify({"error": "Missing token in request body"}), 400
    try:
        decoded = auth.verify_id_token(id_token)
        uid = decoded.get('uid')
        email = decoded.get('email')
        name = decoded.get('name', 'User')

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
def api_logout():
    # No server-side session to clear in stateless token auth
    return jsonify({"message": "Logged out"}), 200

@app.route('/api/user-info', methods=['GET'])
def api_user_info():
    decoded, err_response = verify_token()
    if err_response:
        return err_response
    uid = decoded.get('uid')
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() if user_doc.exists else {
        'credits': 3,
        'subscription_status': 'free',
        'api_calls': 0,
        'last_credit_reset': None
    }
    return jsonify({
        "uid": uid,
        "email": decoded.get('email'),
        "name": decoded.get('name', 'User'),
        "credits": user_data.get('credits', 3),
        "subscription_status": user_data.get('subscription_status', 'free'),
        "last_credit_reset": user_data.get('last_credit_reset'),
        "api_calls": user_data.get('api_calls', 0),
        "stripe_customer_id": user_data.get('stripe_customer_id')
    })

@app.route('/api/user_credits', methods=['GET'])
def api_user_credits():
    decoded, err_response = verify_token()
    if err_response:
        return err_response
    uid = decoded.get('uid')
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() if user_doc.exists else {
        'credits': 3,
        'subscription_status': 'free',
        'api_calls': 0,
        'last_credit_reset': None
    }
    return jsonify({
        "credits": user_data.get('credits', 3),
        "subscription_status": user_data.get('subscription_status', 'free'),
        "email": decoded.get('email'),
        "last_credit_reset": user_data.get('last_credit_reset'),
        "api_calls": user_data.get('api_calls', 0)
    })

@app.route('/pricing', methods=['GET'])
def api_pricing():
    decoded, err_response = verify_token()
    if err_response:
        return err_response
    uid = decoded.get('uid')
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() if user_doc.exists else {}

    plans = [
        {"plan": "Free", "price": 0, "credits": 3, "features": ["3 daily recipes", "Basic support"]},
        {"plan": "Premium Monthly", "price": 5.99, "credits": "Unlimited", "features": ["Unlimited recipes", "Priority support"]},
        {"plan": "Premium Yearly", "price": 49.99, "credits": "Unlimited", "features": ["Unlimited recipes", "Priority support", "10% discount"]},
    ]

    return jsonify({
        "plans": plans,
        "user": {
            "email": decoded.get('email'),
            "subscription_status": user_data.get('subscription_status', 'free'),
            "stripe_customer_id": user_data.get('stripe_customer_id')
        }
    })

@app.route('/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    decoded, err_response = verify_token()
    if err_response:
        return err_response
    try:
        data = request.get_json(force=True)
        plan = data.get('plan')
        price_map = {
            "Premium Monthly": os.environ.get('STRIPE_MONTHLY_PRICE_ID'),
            "Premium Yearly": os.environ.get('STRIPE_YEARLY_PRICE_ID')
        }
        if plan not in price_map or not price_map[plan]:
            return jsonify({"error": "Invalid plan selected."}), 400

        session = stripe.checkout.Session.create(
            customer_email=decoded.get('email'),
            payment_method_types=['card'],
            line_items=[{
                'price': price_map[plan],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/pricing",
            metadata={'uid': decoded.get('uid')}
        )
        return jsonify({"id": session.id})
    except Exception as e:
        logger.error(f"Stripe checkout session error: {e}")
        return jsonify({"error": "Failed to create checkout session"}), 500

@app.route('/stripe/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error(f"Stripe webhook error: {e}")
        return jsonify({"error": "Invalid webhook signature"}), 400

    # Handle relevant webhook events
    if event['type'] == 'checkout.session.completed':
        session_obj = event['data']['object']
        uid = session_obj.get('metadata', {}).get('uid')
        if uid:
            user_ref = db.collection('users').document(uid)
            user_ref.set({
                "stripe_customer_id": session_obj.get('customer'),
                "subscription_id": session_obj.get('subscription'),
                "subscription_status": "premium",
                "credits": 9999,
                "last_credit_reset": datetime.now(timezone.utc).isoformat()
            }, merge=True)
            logger.info(f"User {uid} upgraded to premium")

    elif event['type'] == 'customer.subscription.deleted':
        customer_id = event['data']['object'].get('customer')
        users = db.collection('users').where('stripe_customer_id', '==', customer_id).limit(1).stream()
        for user in users:
            user_ref = db.collection('users').document(user.id)
            user_ref.set({
                "subscription_status": "free",
                "credits": 3,
                "subscription_id": None,
                "last_credit_reset": datetime.now(timezone.utc).isoformat()
            }, merge=True)
            logger.info(f"User {user.id} downgraded to free")

    return jsonify({"status": "success"}), 200

@app.route('/generate', methods=['POST'])
def generate_recipe():
    decoded, err_response = verify_token()
    if err_response:
        return err_response

    uid = decoded.get('uid')
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() if user_doc.exists else {
        "credits": 3,
        "subscription_status": "free",
        "api_calls": 0,
        "last_credit_reset": None
    }

    # Reset daily credits if free user and past reset date
    if user_data.get('subscription_status') == 'free':
        now = datetime.now(timezone.utc)
        last_reset = user_data.get('last_credit_reset')
        last_reset_date = datetime.fromisoformat(last_reset).date() if last_reset else None
        if not last_reset_date or last_reset_date < now.date():
            user_data['credits'] = 3
            user_data['last_credit_reset'] = now.isoformat()
            user_ref.set(user_data, merge=True)
            logger.info(f"Credits reset for user {uid}")

        if user_data.get('credits', 0) <= 0:
            return jsonify({
                "error": "no_credits",
                "message": "You have no credits left. Upgrade to Premium for unlimited recipes."
            }), 403

        user_data['credits'] -= 1
        user_data['api_calls'] = user_data.get('api_calls', 0) + 1
        user_ref.set(user_data, merge=True)
        logger.info(f"User {uid} used one credit, remaining: {user_data['credits']}")

    # Parse request data
    data = request.get_json(force=True)
    ingredients = data.get('ingredients', [])
    dietary = data.get('dietary', [])
    spice_level = data.get('spice_level', 3)
    cook_time = data.get('cook_time', 30)
    difficulty = data.get('difficulty', 'easy')
    portions = data.get('portions', 2)
    cuisine = data.get('cuisine', '')

    # Build prompt for OpenAI
    prompt = f"""You are a friendly, creative recipe assistant. Given these inputs:

Ingredients: {', '.join(ingredients)}
Dietary preferences: {', '.join(dietary)}
Spice level (1-5): {spice_level}
Cook time (minutes): {cook_time}
Difficulty: {difficulty}
Portions: {portions}
Cuisine: {cuisine}

Generate a detailed recipe in markdown format with:
- Title
- Ingredients list
- Step-by-step instructions
- Nutrition info if possible

Make it fun and easy to follow."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful recipe assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.8
        )
        recipe_text = response.choices[0].message.content
        logger.info(f"Generated recipe for user {uid}")

        # --- NEW: Extract Title and Save Recipe to Firestore ---
        # A simple way to get title, you might need a more robust parsing
        # if recipe_text format isn't consistent (e.g., if "Title:" isn't always present).
        # We try to extract it from the markdown, otherwise default.
        title_match = next((line.replace('Title:', '').strip() for line in recipe_text.split('\n') if line.lower().startswith('title:')), 'Untitled Recipe')

        recipe_data_to_save = {
            "user_id": uid,
            "title": title_match, # Extracted title
            "recipe_text": recipe_text, # Full markdown recipe
            "ingredients_selected": ingredients, # Original user selections
            "dietary_selected": dietary,
            "spice_level_requested": spice_level,
            "cook_time_requested": cook_time,
            "difficulty_requested": difficulty,
            "portions_requested": portions,
            "cuisine_requested": cuisine,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        # Add the recipe to a 'recipes' collection in Firestore
        db.collection('recipes').add(recipe_data_to_save)
        logger.info(f"Saved recipe for user {uid} with title: {title_match}")
        # --- END NEW ---

        # Return the generated recipe text and updated credits
        return jsonify({"recipe_text": recipe_text, "credits": user_data['credits']})

    except Exception as e:
        logger.error(f"OpenAI request failed: {e}")
        return jsonify({"error": "OpenAI request failed", "details": str(e)}), 500

# --- NEW: /cookbook endpoint ---
@app.route('/cookbook', methods=['GET'])
def get_user_cookbook():
    decoded, err_response = verify_token()
    if err_response:
        return err_response
    
    uid = decoded.get('uid')
    
    try:
        # Fetch recipes for the authenticated user, ordered by timestamp (newest first)
        recipes_query = db.collection('recipes').where('user_id', '==', uid).order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
        
        recipes_list = []
        for doc in recipes_query:
            recipe_data = doc.to_dict()
            
            # Extract fields for the frontend Recipe type
            full_recipe_text = recipe_data.get('recipe_text', '')
            
            # Frontend expects: id, title, cuisine, dietary, ingredients, instructions, nutrition, timestamp
            # We're passing the full markdown to 'instructions' for now,
            # as the frontend's Cookbook.tsx uses <pre>{recipe.instructions}</pre>
            recipes_list.append({
                "id": doc.id, # Firestore document ID as unique ID for React key
                "title": recipe_data.get('title', 'Generated Recipe'), # Use the saved title
                "cuisine": recipe_data.get('cuisine_requested', 'N/A'),
                "dietary": ', '.join(recipe_data.get('dietary_selected', [])), # Join list to string
                "ingredients": ', '.join(recipe_data.get('ingredients_selected', [])), # Join list to string
                "instructions": full_recipe_text, # Full markdown content goes here
                "nutrition": "See full recipe text for details", # Placeholder or extract specifically
                "timestamp": recipe_data.get('timestamp')
            })
            
        return jsonify(recipes_list), 200

    except Exception as e:
        logger.error(f"Error fetching cookbook for user {uid}: {e}")
        return jsonify({"error": "Failed to fetch recipes"}), 500
# --- END NEW ---

# Serve frontend static files if needed
# IMPORTANT: This block should ideally be removed if your frontend is served by a separate static host
# like Render Static Sites. This is primarily for local development or full-stack deployments.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Adjust 'frontend' to your actual static files directory name relative to app.py
    frontend_dir = os.path.join(basedir, 'frontend') 
    if os.path.exists(frontend_dir):
        if path != "" and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        else:
            return send_from_directory(frontend_dir, 'index.html')
    else:
        # Fallback if frontend directory doesn't exist (e.g., when deployed separately)
        return jsonify({"message": "Backend running, frontend static files not served from here."}), 200


if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 10000)))
