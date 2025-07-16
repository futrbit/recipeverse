from .extensions import db





from datetime import datetime
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200))
    google_id = db.Column(db.String(200), unique=True)
    stripe_customer_id = db.Column(db.String(200))
    subscription_id = db.Column(db.String(200))
    subscription_status = db.Column(db.String(50), default='free')
    credits = db.Column(db.Integer, default=3)  # Set to match app.py logic
    api_calls = db.Column(db.Integer, default=0)
    last_reset = db.Column(db.DateTime)
    recipes = db.relationship('Recipe', backref='author', lazy=True)

    def get_id(self):
        return str(self.id)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    cuisine = db.Column(db.String(100), nullable=True)
    dietary = db.Column(db.Text, nullable=True)       # Stored as JSON string
    ingredients = db.Column(db.Text, nullable=False)  # Stored as JSON string
    instructions = db.Column(db.Text, nullable=False) # Stored as JSON string
    nutrition = db.Column(db.Text, nullable=True)     # Stored as JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Recipe {self.title}>"
