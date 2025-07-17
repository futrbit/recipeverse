import os
import secrets
from flask import Flask, redirect, url_for, session, request, jsonify
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
import openai

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

# Setup Google OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

openai.api_key = os.environ.get('OPENAI_API_KEY')

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return '<a href="/login">Log in with Google</a>'

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    token = google.authorize_access_token()
    user_info = google.parse_id_token(token)
    if not user_info:
        return "Failed to get user info", 400
    session['user'] = {
        'email': user_info['email'],
        'name': user_info.get('name'),
        'picture': user_info.get('picture'),
    }
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('index'))
    user = session['user']
    return (
        f"<h1>Welcome {user.get('name')}</h1>"
        f"<p>Email: {user.get('email')}</p>"
        f'<img src="{user.get("picture")}" alt="profile picture" width="100">'
        '<br><br>'
        '<a href="/logout">Logout</a>'
    )

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

@app.route('/generate', methods=['POST'])
def generate_recipe():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # Create prompt for recipe generation (adjust as needed)
    full_prompt = f"Generate a detailed recipe based on the following input:\n{prompt}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.7,
            max_tokens=500,
        )
        recipe_text = response.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({"error": "OpenAI API error", "details": str(e)}), 500

    return jsonify({"recipe": recipe_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
