from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Allow your Vercel frontend (and localhost for local testing)
    CORS(app, origins=[
        "https://vercel.app",
        "http://localhost:5000",
        "http://localhost:5173"
    ])
    
    # Register your blueprints/routes here
    return app
