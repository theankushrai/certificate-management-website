from flask import Blueprint, jsonify, request
from models.certificate import Certificate
import uuid
from datetime import datetime, timedelta
from dateutil import tz

# Create a Blueprint for our main routes
main = Blueprint('main', __name__)

# In-memory storage (we'll replace this with DynamoDB later)
certificates_store = {}

@main.route('/')
def index():
    """Root endpoint - redirect to certificates endpoint"""
    return get_certificates()

@main.route('/api/v1/certificates', methods=['GET'])
def get_certificates():
    """Get all certificates, sorted by expiration date (ascending)"""
    # Convert certificates to list of dicts
    certs_list = [cert.to_dict() for cert in certificates_store.values()]
    
    # Sort by valid_until date (None values will be placed at the end)
    def get_sort_key(cert):
        valid_until = cert.get('valid_until')
        if not valid_until:
            return (1, '')  # Push certificates without expiration date to the end
        try:
            # Return a sortable tuple (0 for valid dates, then the date itself)
            return (0, datetime.fromisoformat(valid_until.replace('Z', '+00:00')))
        except (ValueError, AttributeError):
            return (1, '')  # Push invalid dates to the end
    
    # Sort the certificates
    sorted_certs = sorted(certs_list, key=get_sort_key)
    
    return jsonify({
        'status': 'success',
        'data': sorted_certs
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
        valid_from=now,  # Always use current time for new certs
        valid_until=data['valid_until'],
        status='active'
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
    
    # Generate new ID and timestamps with timezone info
    new_id = str(uuid.uuid4())
    now = datetime.now(tz.tzutc()).isoformat()
    valid_until = (datetime.now(tz.tzutc()) + timedelta(days=365)).isoformat()  # 1 year from now
    
    # Create new certificate with same data but new ID and dates
    new_cert = Certificate(
        id=new_id,
        domain_name=old_cert.domain_name,
        common_name=old_cert.common_name,
        issuer=old_cert.issuer,
        valid_from=now,  # Set to current time on rotation
        valid_until=valid_until,
        fingerprint_sha256=None  # Will be auto-generated
    )
    
    # Store the new certificate
    certificates_store[new_id] = new_cert
    
    # Delete the old certificate
    del certificates_store[cert_id]
    
    return jsonify({
        'status': 'success',
        'data': new_cert.to_dict()
    }), 201