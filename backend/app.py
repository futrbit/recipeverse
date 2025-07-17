import os
import logging
import json
import secrets
from datetime import timedelta, datetime

from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import openai

# Load environment variables from .env
load_dotenv()

# Strip FRONTEND_URL to avoid newline/whitespace issues
frontend_url = os.environ.get("FRONTEND_URL", "https://recipeverse-frontend.onrender.com")
if frontend_url:
    frontend_url = frontend_url.strip()
print(f"Using FRONTEND_URL (repr): {repr(frontend_url)}")

# Firebase credentials from environment variables (split vars method)
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

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    db_firestore = firestore.client()
    print("Firebase Admin initialized successfully.")
except Exception as e:
    print(f"Failed to initialize Firebase Admin: {e}")
    raise

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Setup CORS with safe origins
CORS(app, supports_credentials=True, origins=[frontend_url, "http://localhost:5173"])

# Initialize OpenAI key
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Basic health check route
@app.route("/")
def index():
    return redirect(frontend_url)

# Example route that uses Firestore and OpenAI (simplified)
@app.route("/generate", methods=["POST"])
def generate_recipe():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    try:
        # Use OpenAI to generate something
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=150,
        )
        generated_text = response.choices[0].text.strip()

        # Save to Firestore (example)
        doc_ref = db_firestore.collection("recipes").document()
        doc_ref.set({
            "prompt": prompt,
            "generated": generated_text,
            "timestamp": datetime.utcnow()
        })

        return jsonify({"generated": generated_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
