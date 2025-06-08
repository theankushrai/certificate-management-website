from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    # Create the Flask application
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_class)
    
    # Enable CORS for all routes
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    
    # Initialize database connection here (we'll add this later)
    
    # Register blueprints (routes)
    from routes import main
    app.register_blueprint(main)
    
    # Simple route to test if the app is working
    @app.route('/test')
    def test_route():
        return {'message': 'Certificate Manager API is running!'}
    
    return app