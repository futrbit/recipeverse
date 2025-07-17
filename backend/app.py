import os
from flask import Flask, redirect, url_for, session, request
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev_secret_key")  # Change in prod!

# Register OAuth client
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@app.route('/')
def home():
    if 'profile' in session:
        user = session['profile']
        return f"Logged in as: {user['email']} <br><a href='/logout'>Logout</a>"
    else:
        return "<a href='/login'>Log in with Google</a>"

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/login/google/authorized')
def authorize():
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    # Store user info in session
    session['profile'] = user_info
    return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('profile', None)
    return redirect(url_for('home'))



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)

