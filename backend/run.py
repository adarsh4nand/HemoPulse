from flask_cors import CORS
from app import create_app

app = create_app()

# Allow requests from your Vercel frontend and local development servers
CORS(app, origins=[
    "https://vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
