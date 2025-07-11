from sqlalchemy import create_engine
import os

# Define the database path
base_dir = os.path.abspath(os.path.dirname(__file__))
database_path = os.path.join(base_dir, "database.db")
database_url = f"sqlite:///{database_path}"

try:
    # Create the engine with logging
    engine = create_engine(database_url, echo=True)
    # Test the connection
    with engine.connect() as connection:
        print("SQLAlchemy connection successful!")
except Exception as e:
    print(f"Error: {e}")