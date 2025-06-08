from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    # Create the Flask application
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_class)
    
    # Enable CORS
    CORS(app)
    
    # Initialize database connection here (we'll add this later)
    
    # Register blueprints (routes)
    from routes import main
    app.register_blueprint(main)
    
    # Simple route to test if the app is working
    @app.route('/test')
    def test_route():
        return {'message': 'Certificate Manager API is running!'}
    
    return app