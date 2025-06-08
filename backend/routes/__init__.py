from flask import Blueprint, jsonify, request
from models.certificate import Certificate
import uuid
from datetime import datetime, timedelta

# Create a Blueprint for our main routes
main = Blueprint('main', __name__)

# In-memory storage (we'll replace this with DynamoDB later)
certificates_store = {}

@main.route('/')
def index():
    """Root endpoint - returns a basic API description"""
    return jsonify({
        'name': 'Certificate Manager API',
        'version': '1.0.0',
        'endpoints': {
            'certificates': '/api/v1/certificates',
            'certificate': '/api/v1/certificates/<id>'
        }
    })

@main.route('/api/v1/certificates', methods=['GET'])
def get_certificates():
    """Get all certificates"""
    return jsonify({
        'status': 'success',
        'data': [cert.to_dict() for cert in certificates_store.values()]
    })

@main.route('/api/v1/certificates/<cert_id>', methods=['GET'])
def get_certificate(cert_id):
    """Get a single certificate by ID"""
    if cert_id not in certificates_store:
        return jsonify({
            'status': 'error',
            'message': 'Certificate not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': certificates_store[cert_id].to_dict()
    })

@main.route('/api/v1/certificates', methods=['POST'])
def create_certificate():
    """Create a new certificate"""
    data = request.get_json()
    
    # Basic validation
    required_fields = ['domain_name', 'common_name', 'issuer', 'valid_until']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    # Create new certificate
    cert_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    certificate = Certificate(
        id=cert_id,
        domain_name=data['domain_name'],
        common_name=data['common_name'],
        issuer=data['issuer'],
        valid_from=data.get('valid_from', now),
        valid_until=data['valid_until'],
        status='active',
        created_at=now,
        updated_at=now
    )
    
    # Store the certificate (in-memory for now)
    certificates_store[cert_id] = certificate
    
    return jsonify({
        'status': 'success',
        'data': certificate.to_dict()
    }), 201

@main.route('/api/v1/certificates/<cert_id>', methods=['DELETE'])
def delete_certificate(cert_id):
    """Delete a certificate"""
    if cert_id not in certificates_store:
        return jsonify({
            'status': 'error',
            'message': 'Certificate not found'
        }), 404
    
    # Delete the certificate
    del certificates_store[cert_id]
    
    return jsonify({
        'status': 'success',
        'message': 'Certificate deleted successfully'
    })
    
@main.route('/api/v1/certificates/<cert_id>/rotate', methods=['POST'])
def rotate_certificate(cert_id):
    """Rotate a certificate (create new with new dates, delete old)"""
    if cert_id not in certificates_store:
        return jsonify({
            'status': 'error',
            'message': 'Certificate not found'
        }), 404
    
    # Get the existing certificate
    old_cert = certificates_store[cert_id]
    
    # Generate new ID and timestamps
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    valid_until = (datetime.utcnow() + timedelta(days=365)).isoformat()  # 1 year from now
    
    # Create new certificate with same data but new ID and dates
    new_cert = Certificate(
        id=new_id,
        domain_name=old_cert.domain_name,
        common_name=old_cert.common_name,
        issuer=old_cert.issuer,
        valid_from=now,
        valid_until=valid_until,
        status='active',
        created_at=now,
        updated_at=now
    )
    
    # Store the new certificate
    certificates_store[new_id] = new_cert
    
    # Delete the old certificate
    del certificates_store[cert_id]
    
    return jsonify({
        'status': 'success',
        'data': new_cert.to_dict()
    }), 201