import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Read allowed origins from environment variable (comma-separated)
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173,http://localhost:3000')
    origins = [origin.strip() for origin in frontend_url.split(',') if origin.strip()]

    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    from .routes import main_routes
    app.register_blueprint(main_routes)

    return app
