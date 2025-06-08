import os
from dotenv import load_dotenv

# Load environment variables from .env file
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '../.env'))

class Config:
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    
    # Database configuration (we'll add DynamoDB settings later)
    DYNAMODB_REGION = os.environ.get('DYNAMODB_REGION')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-123'
    JWT_ALGORITHM = 'HS256'
    
    # API Version
    API_VERSION = 'v1'