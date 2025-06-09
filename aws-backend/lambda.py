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

# Define the maximum number of certificates allowed in the table
MAX_CERTIFICATES = 10 

def get_headers():
    """Return consistent headers for all responses for CORS"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', # Allow all origins for development
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', # Allowed HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token' # Allowed headers for preflight
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
    based on HTTP method and path, implementing RESTful patterns.
    """
    print("Received event:", json.dumps(event, indent=2))
    
    # Handle preflight OPTIONS request for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return success_response(200, {})
    
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    try:
        # GET operations: Retrieve all certificates or a single certificate by ID (path parameter)
        if http_method == 'GET':
            # Check for path parameter /certificates/{id}
            path_parameters = event.get('pathParameters')
            if path_parameters and path_parameters.get('id'):
                certificate_id = path_parameters['id']
                print(f"Routing GET request for single certificate with ID: {certificate_id}")
                return get_certificate(certificate_id)
            # Check for base path /certificates to get all
            elif path == '/certificates':
                print("Routing GET request for all certificates.")
                return get_all_certificates()
            else:
                return error_response(400, 'Invalid GET request path or missing ID for single retrieval.')
            
        # POST operations: Create certificate or Rotate certificate
        elif http_method == 'POST':
            if path == '/certificates':
                print("Routing POST request to create a new certificate.")
                if not event.get('body'):
                    return error_response(400, 'Request body is required')
                try:
                    body = json.loads(event['body'])
                except json.JSONDecodeError:
                    return error_response(400, 'Invalid JSON in request body')
                return create_certificate(body)
            elif path.startswith('/certificates/') and path.endswith('/rotate'):
                print("Routing POST request to rotate a certificate.")
                # Extract certificate ID from path (e.g., /certificates/123/rotate)
                cert_id = path.split('/')[-2]
                if not cert_id:
                    return error_response(400, 'Certificate ID for rotation is required')
                return rotate_certificate(cert_id)
            else:
                return error_response(400, 'Invalid POST request path.')

        # DELETE operation: Delete a certificate by ID (path parameter)
        elif http_method == 'DELETE' and path.startswith('/certificates/'):
            print("Routing DELETE request to delete a certificate.")
            # Extract certificate ID from path (e.g., /certificates/123)
            cert_id = path.split('/')[-1]
            if not cert_id:
                return error_response(400, 'Certificate ID for deletion is required')
            return delete_certificate(cert_id)
        
        # Fallback for any unhandled methods/paths
        else:
            return error_response(400, 'Invalid request method or path')
            
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        # Return a generic internal server error for unexpected exceptions
        return error_response(500, 'Internal server error')

def get_all_certificates():
    """Retrieve all certificates from DynamoDB"""
    try:
        print("1. Starting get_all_certificates function")
        print(f"2. Table name: {table_name}")
        
        # Check if table exists (optional, mostly for initial setup/debugging)
        try:
            print("3. Checking if table exists...")
            table.load() # This performs a describe_table call to verify existence and access
            print("4. Table exists and is accessible")
        except Exception as e:
            print(f"5. Error accessing table: {str(e)}")
            # If table load fails, it's a severe config error
            return error_response(500, f'DynamoDB table error: {str(e)}')
            
        # Try to scan the table to get all items
        try:
            print("6. Attempting to scan table...")
            response = table.scan()
            # Ensure proper serialization for logging complex objects
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
    """Retrieve a single certificate by ID using the GSI"""
    try:
        print(f"Attempting to retrieve certificate with ID: {certificate_id}")
        response = table.query(
            IndexName='CertificateIdIndex', # Querying the GSI
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            print(f"Certificate with ID {certificate_id} not found.")
            return error_response(404, 'Certificate not found')
            
        print(f"Found certificate: {json.dumps(items[0], default=str)}")
        return success_response(200, items[0])
    except Exception as e:
        print(f"Error getting certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to retrieve certificate')

def create_certificate(cert_data):
    """
    Create a new certificate in DynamoDB.
    Enforces a maximum number of certificates and sets a TTL for 1 day.
    """
    try:
        if not isinstance(cert_data, dict) or not cert_data.get('domain_name'):
            return error_response(400, 'domain_name is required')

        # --- START: Enforce 10-item limit ---
        print("Checking current item count in table for creation limit...")
        # Use a consistent read for the count if strict limit is needed (though scan might not be consistent by default)
        # For a hard limit like this, a scan is typically sufficient and easier.
        response = table.scan(
            Select='COUNT' # Only retrieve the count, not the actual items
        )
        current_item_count = response.get('Count', 0)
        print(f"Current item count: {current_item_count}")

        if current_item_count >= MAX_CERTIFICATES:
            print(f"Limit of {MAX_CERTIFICATES} certificates reached. Cannot create new certificate.")
            return error_response(400, f'Maximum of {MAX_CERTIFICATES} certificates reached. Please delete an existing certificate before creating a new one.')
        # --- END: Enforce 10-item limit ---

        cert_id = str(uuid.uuid4())
        now_utc = datetime.now(timezone.utc)
        
        # --- START: TTL Logic - set ttl_timestamp for 1 day from now ---
        expiry_time = now_utc + timedelta(days=1)
        # Convert to Unix epoch timestamp in seconds (integer)
        ttl_timestamp_seconds = int(expiry_time.timestamp())
        print(f"New certificate will expire at (TTL): {expiry_time.isoformat()} ({ttl_timestamp_seconds} Unix epoch seconds)")
        # --- END: TTL Logic ---

        certificate = {
            'user_id': 'default', # Using 'default' as partition key, adjust if users are implemented
            'certificate_id': cert_id,
            'domain_name': cert_data['domain_name'],
            'common_name': cert_data.get('common_name', cert_data['domain_name']),
            'issuer': cert_data.get('issuer', 'Let\'s Encrypt'),
            'valid_from': cert_data.get('valid_from', now_utc.isoformat()),
            'valid_until': cert_data.get('valid_until', 
                (now_utc + timedelta(days=365)).isoformat()), # Application-level validity
            'status': 'active',
            'created_at': now_utc.isoformat(),
            'updated_at': now_utc.isoformat(),
            'metadata': cert_data.get('metadata', {}),
            'ttl_timestamp': ttl_timestamp_seconds # <--- NEW: TTL attribute for automatic deletion
        }
        
        table.put_item(Item=certificate)
        print(f"Successfully created certificate: {cert_id}")
        return success_response(201, certificate) # Return 201 Created for new resources
        
    except Exception as e:
        print(f"Error creating certificate: {str(e)}")
        return error_response(500, 'Failed to create certificate')

def rotate_certificate(certificate_id):
    """
    Rotate a certificate by creating a new one with updated dates and deleting the old one.
    Also sets a TTL for the new certificate.
    """
    try:
        # Get the existing certificate to copy its details
        print(f"Attempting to rotate certificate with ID: {certificate_id}")
        response = table.query(
            IndexName='CertificateIdIndex',
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            print(f"Certificate with ID {certificate_id} not found for rotation.")
            return error_response(404, 'Certificate not found')
            
        old_cert = items[0]
        now_utc = datetime.now(timezone.utc)
        
        # --- START: TTL Logic for the new rotated certificate ---
        expiry_time = now_utc + timedelta(days=1)
        ttl_timestamp_seconds = int(expiry_time.timestamp())
        print(f"New rotated certificate will expire at (TTL): {expiry_time.isoformat()} ({ttl_timestamp_seconds} Unix epoch seconds)")
        # --- END: TTL Logic ---

        new_cert_id = str(uuid.uuid4())
        new_cert = {
            'user_id': old_cert['user_id'],
            'certificate_id': new_cert_id,
            'domain_name': old_cert['domain_name'],
            'common_name': old_cert.get('common_name', old_cert['domain_name']),
            'issuer': old_cert.get('issuer', 'Let\'s Encrypt'),
            'valid_from': now_utc.isoformat(),
            'valid_until': (now_utc + timedelta(days=365)).isoformat(),
            'status': 'active',
            'created_at': now_utc.isoformat(),
            'updated_at': now_utc.isoformat(),
            'metadata': old_cert.get('metadata', {}),
            'ttl_timestamp': ttl_timestamp_seconds # <--- NEW: TTL attribute for rotated item
        }
        
        # Use a transaction (batch_writer) for atomic put and delete
        with table.batch_writer() as batch:
            batch.put_item(Item=new_cert)
            batch.delete_item(
                Key={
                    'user_id': old_cert['user_id'], # Ensure user_id is used for deletion as it's the PK
                    'certificate_id': certificate_id
                }
            )
        
        print(f"Successfully rotated certificate. Old ID: {certificate_id}, New ID: {new_cert_id}")
        return success_response(200, new_cert, 'Certificate rotated successfully')
        
    except Exception as e:
        print(f"Error rotating certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to rotate certificate')

def delete_certificate(certificate_id):
    """Delete a certificate from DynamoDB"""
    try:
        print(f"Attempting to delete certificate with ID: {certificate_id}")
        # First get the certificate to verify it exists and get the user_id (Partition Key)
        response = table.query(
            IndexName='CertificateIdIndex', # Querying the GSI by certificate_id
            KeyConditionExpression=Key('certificate_id').eq(certificate_id)
        )
        
        items = response.get('Items', [])
        if not items:
            print(f"Certificate with ID {certificate_id} not found for deletion.")
            return error_response(404, 'Certificate not found')
            
        # Delete the certificate using its primary key (user_id and certificate_id)
        table.delete_item(
            Key={
                'user_id': items[0]['user_id'], # Get user_id from the retrieved item
                'certificate_id': certificate_id
            }
        )
        
        print(f"Certificate with ID {certificate_id} deleted successfully.")
        # 204 No Content for successful deletion (as per REST best practices)
        return success_response(204, None, 'Certificate deleted successfully') 
        
    except Exception as e:
        print(f"Error deleting certificate {certificate_id}: {str(e)}")
        # Corrected the extra text after return statement
        return error_response(500, 'Failed to delete certificate')
