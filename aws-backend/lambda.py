import json
import boto3
import uuid
from datetime import datetime, timedelta, timezone
from boto3.dynamodb.conditions import Key
import os
from decimal import Decimal # Import Decimal type

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('CERTIFICATES_TABLE', 'Certificates')
table = dynamodb.Table(table_name)

# Define the maximum number of certificates allowed in the table
MAX_CERTIFICATES = 10 

# Helper function to handle Decimal types for JSON serialization
def decimal_default_encoder(obj):
    if isinstance(obj, Decimal):
        # Check if it's an integer or float, then convert accordingly
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    # Revert to default JSON encoder for other types
    raise TypeError(repr(obj) + " is not JSON serializable")

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
        # Use our custom encoder when dumping data to JSON
        body['data'] = data
    if message:
        body['message'] = message
    
    # Apply custom encoder for all JSON dumping
    # This ensures any Decimal values in the response data are handled
    return {
        'statusCode': status_code,
        'headers': get_headers(),
        'body': json.dumps(body, default=decimal_default_encoder) if body else None
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
            # This line caused the error when dumping 'response' directly due to Decimal objects.
            # We will now handle Decimal serialization in the success_response helper.
            print(f"7. Scan response received. Items count: {response.get('Count', 0)}") 
            
            items = response.get('Items', [])
            print(f"8. Found {len(items)} items")
            
            # Recalculate status for each certificate based on current date
            for item in items:
                try:
                    print(f"\nProcessing certificate: {item.get('certificate_id', 'unknown')}")
                    print(f"Current status in DB: {item.get('status', 'not set')}")
                    print(f"Valid from: {item.get('valid_from', 'not set')}")
                    print(f"Valid until: {item.get('valid_until', 'not set')}")
                    
                    # Update the status based on current date and validity period
                    item['status'] = calculate_status(
                        item.get('valid_from', ''),
                        item.get('valid_until', '')
                    )
                    print(f"New calculated status: {item['status']}")
                except Exception as e:
                    print(f"Error updating status for certificate {item.get('certificate_id', 'unknown')}: {str(e)}")
                    item['status'] = 'active'  # Default to active if there's an error
            
            return success_response(200, items) # `items` will now be properly serialized by success_response
            
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
            
        # `items[0]` might contain Decimal, so we rely on success_response to handle it.
        print(f"Found certificate: {json.dumps(items[0], default=decimal_default_encoder)}") 
        return success_response(200, items[0])
    except Exception as e:
        print(f"Error getting certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to retrieve certificate')

def create_certificate(cert_data):
    """
    Create a new certificate in DynamoDB.
    Enforces a maximum number of certificates and sets a TTL for 1 hour.
    """
    try:
        if not isinstance(cert_data, dict) or not cert_data.get('domain_name'):
            return error_response(400, 'domain_name is required')

        # --- START: Enforce 10-item limit ---
        print("Checking current item count in table for creation limit...")
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
        
        # --- START: TTL Logic - set ttl_timestamp for 1 hour from now ---
        expiry_time = now_utc + timedelta(hours=1) # Set to 1 hour
        # Convert to Unix epoch timestamp in seconds (integer)
        ttl_timestamp_seconds = int(expiry_time.timestamp())
        print(f"New certificate will expire at (TTL): {expiry_time.isoformat()} ({ttl_timestamp_seconds} Unix epoch seconds)")
        # --- END: TTL Logic ---

        # Get the validity dates
        valid_from = cert_data.get('valid_from', now_utc.isoformat())
        valid_until = cert_data.get('valid_until', (now_utc + timedelta(days=365)).isoformat())
        
        # Log the dates being used for status calculation
        print(f"Creating certificate with dates - valid_from: {valid_from}, valid_until: {valid_until}")
        
        # Calculate the status based on the provided dates
        status = calculate_status(valid_from, valid_until)
        print(f"Calculated status for new certificate: {status}")
        
        certificate = {
            'user_id': 'default', # Using 'default' as partition key, adjust if users are implemented
            'certificate_id': cert_id,
            'domain_name': cert_data['domain_name'],
            'common_name': cert_data.get('common_name', cert_data['domain_name']),
            'issuer': cert_data.get('issuer', 'Let\'s Encrypt'),
            'valid_from': valid_from,
            'valid_until': valid_until,
            'status': status,
            'created_at': now_utc.isoformat(),
            'updated_at': now_utc.isoformat(),
            'metadata': cert_data.get('metadata', {}),
            'ttl_timestamp': ttl_timestamp_seconds # TTL attribute for automatic deletion
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
        expiry_time = now_utc + timedelta(hours=1) # Set to 1 hour
        ttl_timestamp_seconds = int(expiry_time.timestamp())
        print(f"New rotated certificate will expire at (TTL): {expiry_time.isoformat()} ({ttl_timestamp_seconds} Unix epoch seconds)")
        # --- END: TTL Logic ---

        # Calculate the new validity period (1 year from now)
        new_valid_from = now_utc.isoformat()
        new_valid_until = (now_utc + timedelta(days=365)).isoformat()
        
        # Log the dates being used for status calculation
        print(f"Rotating certificate with dates - valid_from: {new_valid_from}, valid_until: {new_valid_until}")
        
        # Calculate the status based on the new dates
        status = calculate_status(new_valid_from, new_valid_until)
        print(f"Calculated status for rotated certificate: {status}")
        
        new_cert_id = str(uuid.uuid4())
        new_cert = {
            'user_id': old_cert['user_id'],
            'certificate_id': new_cert_id,
            'domain_name': old_cert['domain_name'],
            'common_name': old_cert.get('common_name', old_cert['domain_name']),
            'issuer': old_cert.get('issuer', 'Let\'s Encrypt'),
            'valid_from': new_valid_from,
            'valid_until': new_valid_until,
            'status': status,
            'created_at': now_utc.isoformat(),
            'updated_at': now_utc.isoformat(),
            'metadata': old_cert.get('metadata', {}),
            'ttl_timestamp': ttl_timestamp_seconds # TTL attribute for rotated item
        }
        
        # Use a transaction (batch_writer) for atomic put and delete
        with table.batch_writer() as batch:
            batch.put_item(Item=new_cert)
            # Ensure the old item is deleted using its complete primary key
            batch.delete_item(
                Key={
                    'user_id': old_cert['user_id'], 
                    'certificate_id': certificate_id
                }
            )
        
        print(f"Successfully rotated certificate. Old ID: {certificate_id}, New ID: {new_cert_id}")
        return success_response(200, new_cert, 'Certificate rotated successfully')
        
    except Exception as e:
        print(f"Error rotating certificate {certificate_id}: {str(e)}")
        return error_response(500, 'Failed to rotate certificate')

def calculate_status(valid_from_str, valid_until_str):
    """
    Calculate the status of a certificate based on current date and validity period.
    Returns:
    - 'expired' if the current date is after valid_until
    - 'warning' if the certificate expires within 90 days
    - 'active' for all other valid certificates
    """
    try:
        # Get current time in UTC with timezone
        now = datetime.now(timezone.utc)
        print(f"Current time (UTC): {now.isoformat()}")
        print(f"Valid until string: {valid_until_str}")
        
        # Parse the valid_until date and ensure it's timezone-aware in UTC
        valid_until_str = valid_until_str.replace('Z', '+00:00')  # Handle 'Z' timezone
        try:
            valid_until = datetime.fromisoformat(valid_until_str)
            # If the datetime is naive (no timezone), assume it's in UTC
            if valid_until.tzinfo is None:
                valid_until = valid_until.replace(tzinfo=timezone.utc)
                print(f"Assumed timezone-naive date as UTC: {valid_until.isoformat()}")
            else:
                print(f"Parsed timezone-aware date: {valid_until.isoformat()}")
        except ValueError as e:
            print(f"Error paarsing date {valid_until_str}: {str(e)}")
            return 'active'  # Default to active on parse error
            
        # Ensure both datetimes are timezone-aware before comparison
        if valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)
            
        # Calculate days until expiry
        time_until_expiry = valid_until - now
        days_until_expiry = time_until_expiry.days
        
        # Log the comparison
        print(f"Now (UTC): {now.isoformat()}")
        print(f"Valid until: {valid_until.isoformat()}")
        print(f"Days until expiry: {days_until_expiry}")
        
        # Check if certificate is expired
        if now > valid_until:
            print("Status: expired")
            return 'expired'
            
        # Check if certificate is expiring soon (within 90 days)
        if days_until_expiry <= 90:
            print("Status: warning - expiring soon")
            return 'warning'
            
        print("Status: active")
        return 'active'
    except Exception as e:
        print(f"Error calculating status: {str(e)}")
        return 'active'  # Default to active if there's an error

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
        return error_response(500, 'Failed to delete certificate')
