import json
import boto3
import uuid
from datetime import datetime, timedelta, timezone
from boto3.dynamodb.conditions import Key
import os

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('CERTIFICATES_TABLE', 'Certificates')
table = dynamodb.Table(table_name)

def get_headers():
    """Return consistent headers for all responses"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    }

def error_response(status_code, message):
    """Helper function to create consistent error responses"""
    return {
        'statusCode': status_code,
        'headers': get_headers(),
        'body': json.dumps({'error': message})
    }

def success_response(status_code, data=None, message=None):
    """Helper function to create consistent success responses"""
    body = {}
    if data is not None:
        body['data'] = data
    if message:
        body['message'] = message
    return {
        'statusCode': status_code,
        'headers': get_headers(),
        'body': json.dumps(body) if body else None
    }

def lambda_handler(event, context):
    """
    Main Lambda handler that routes requests to appropriate functions
    based on HTTP method and path.
    """
    print("Received event:", json.dumps(event, indent=2))
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return success_response(200, {})
    
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    try:
        # Route the request to the appropriate handler
        if http_method == 'GET' and path == '/certificates':
            query_params = event.get('queryStringParameters') 
            if query_params is not None and query_params.get('id'):
                return get_certificate(query_params['id'])
            return get_all_certificates()
            
        elif http_method == 'POST' and path == '/certificates':
            if not event.get('body'):
                return error_response(400, 'Request body is required')
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return error_response(400, 'Invalid JSON in request body')
            return create_certificate(body)
            
        elif http_method == 'POST' and path.startswith('/certificates/') and path.endswith('/rotate'):
            cert_id = path.split('/')[-2]
            if not cert_id:
                return error_response(400, 'Certificate ID is required')
            return rotate_certificate(cert_id)
            
        elif http_method == 'DELETE' and path.startswith('/certificates/'):
            cert_id = path.split('/')[-1]
            if not cert_id:
                return error_response(400, 'Certificate ID is required')
            return delete_certificate(cert_id)
            
        else:
            return error_response(400, 'Invalid request')
            
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return error_response(500, 'Internal server error')

def get_all_certificates():
    """Retrieve all certificates from DynamoDB"""
    try:
        print("1. Starting get_all_certificates function")
        print(f"2. Table name: {table_name}")
        
        # Check if table exists
        try:
            print("3. Checking if table exists...")
            table.load()
            print("4. Table exists and is accessible")
        except Exception as e:
            print(f"5. Error accessing table: {str(e)}")
            return error_response(500, f'DynamoDB table error: {str(e)}')
        
        # Try to scan the table
        try:
            print("6. Attempting to scan table...")
            response = table.scan()
            print(f"7. Scan response received: {json.dumps(response, default=str)}")
            
            items = response.get('Items', [])
            print(f"8. Found {len(items)} items")
            
            return success_response(200, items)
            
        except Exception as e:
            print(f"9. Error during scan: {str(e)}")
            return error_response(500, f'Scan failed: {str(e)}')
            
    except Exception as e:
        print(f"10. Unexpected error in get_all_certificates: {str(e)}")
        return error_response(500, 'Unexpected error occurred')

def get_certificate(certificate_id):
    """Retrieve a single certificate by ID"""
    try:
        response = table.query(
            IndexName='CertificateIdIndex',
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            return error_response(404, 'Certificate not found')
            
        return success_response(200, items[0])
    except Exception as e:
        print(f"Error getting certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to retrieve certificate')

def create_certificate(cert_data):
    """Create a new certificate in DynamoDB"""
    try:
        if not isinstance(cert_data, dict) or not cert_data.get('domain_name'):
            return error_response(400, 'domain_name is required')
            
        cert_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        certificate = {
            'user_id': 'default',
            'certificate_id': cert_id,
            'domain_name': cert_data['domain_name'],
            'common_name': cert_data.get('common_name', cert_data['domain_name']),
            'issuer': cert_data.get('issuer', 'Let\'s Encrypt'),
            'valid_from': cert_data.get('valid_from', now),
            'valid_until': cert_data.get('valid_until', 
                (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()),
            'status': 'active',
            'created_at': now,
            'updated_at': now,
            'metadata': cert_data.get('metadata', {})
        }
        
        table.put_item(Item=certificate)
        return success_response(201, certificate)
        
    except Exception as e:
        print(f"Error creating certificate: {str(e)}")
        return error_response(500, 'Failed to create certificate')

def rotate_certificate(certificate_id):
    """Rotate a certificate by creating a new one with updated dates"""
    try:
        # Get the existing certificate
        response = table.query(
            IndexName='CertificateIdIndex',
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            return error_response(404, 'Certificate not found')
            
        old_cert = items[0]
        now = datetime.now(timezone.utc)
        
        # Create new certificate with updated dates
        new_cert_id = str(uuid.uuid4())
        new_cert = {
            'user_id': old_cert['user_id'],
            'certificate_id': new_cert_id,
            'domain_name': old_cert['domain_name'],
            'common_name': old_cert.get('common_name', old_cert['domain_name']),
            'issuer': old_cert.get('issuer', 'Let\'s Encrypt'),
            'valid_from': now.isoformat(),
            'valid_until': (now + timedelta(days=365)).isoformat(),
            'status': 'active',
            'created_at': now.isoformat(),
            'updated_at': now.isoformat(),
            'metadata': old_cert.get('metadata', {})
        }
        
        # Use a transaction for atomic operation
        with table.batch_writer() as batch:
            batch.put_item(Item=new_cert)
            batch.delete_item(
                Key={
                    'user_id': old_cert['user_id'],
                    'certificate_id': certificate_id
                }
            )
        
        return success_response(200, new_cert)
        
    except Exception as e:
        print(f"Error rotating certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to rotate certificate')

def delete_certificate(certificate_id):
    """Delete a certificate from DynamoDB"""
    try:
        # First get the certificate to verify it exists and get the user_id
        response = table.query(
            IndexName='CertificateIdIndex',
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            return error_response(404, 'Certificate not found')
            
        # Delete the certificate
        table.delete_item(
            Key={
                'user_id': items[0]['user_id'],
                'certificate_id': certificate_id
            }
        )
        
        return success_response(204, None, 'Certificate deleted successfully')
        
    except Exception as e:
        print(f"Error deleting certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to delete certificate')