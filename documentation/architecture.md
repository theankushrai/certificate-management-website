# Certificate Manager Architecture

## System Overview

This document outlines the architecture of the Certificate Manager application, built using AWS Serverless technologies.

```
+--------------------------------------------------+
|               Frontend (AWS Amplify)              |
|  +--------------------------------------------+  |
|  |             React Application              |  |
|  |  - Certificate List/Table View             |  |
|  |  - Add/Edit/Delete Certificates            |  |
|  |  - Real-time Status Updates                |  |
|  +--------------------------------------------+  |
+--------------------------+-----------------------+
                           |
                           | HTTPS (REST API)
                           v
+--------------------------------------------------+
|               AWS API Gateway                    |
|  +--------------------------------------------+  |
|  |              HTTP Endpoints:               |  |
|  |  - GET    /certificates                    |  |
|  |  - POST   /certificates                    |  |
|  |  - GET    /certificates/{id}               |  |
|  |  - PUT    /certificates/{id}               |  |
|  |  - DELETE /certificates/{id}               |  |
|  +--------------------------------------------+  |
+--------------------------+-----------------------+
                           |
                           | Triggers
                           v
+--------------------------------------------------+
|               AWS Lambda Functions               |
|  +------------------+  +---------------------+  |
|  |   API Handlers   |  |  Background Tasks   |  |
|  |  - Process HTTP  |  |  - Check Expiry    |  |
|  |    requests      |  |  - Send Alerts     |  |
|  |  - Validate Input|  |  - Generate Certs  |  |
|  |  - Call Database |  +---------------------+  |
|  +------------------+                           |
+--------------------------+-----------------------+
                           |
                           | Read/Write
                           v
+--------------------------------------------------+
|               AWS DynamoDB                      |
|  +--------------------------------------------+  |
|  |              Certificates Table             |  |
|  |  - user_id (Partition Key)                 |  |
|  |  - certificate_id (Sort Key)               |  |
|  |  - domain_name, expiry_date, status, etc.  |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

## Component Details

### 1. Frontend (AWS Amplify)
- **Technology**: React.js
- **Hosting**: AWS Amplify (auto-deploy from Git)
- **Features**:
  - Responsive UI for certificate management
  - Real-time updates
  - User authentication

### 2. API Gateway
- **Type**: REST API
- **Authentication**: API Keys + IAM
- **Endpoints**:
  - `GET /certificates` - List all certificates
  - `POST /certificates` - Create new certificate
  - `GET /certificates/{id}` - Get certificate details
  - `PUT /certificates/{id}` - Update certificate
  - `DELETE /certificates/{id}` - Delete certificate

### 3. Lambda Functions

#### API Handlers
- Process incoming HTTP requests
- Validate input data
- Interact with DynamoDB
- Format responses

#### Background Tasks
- **Certificate Expiry Checker**: Runs periodically to check for expiring certificates
- **Notification Service**: Sends alerts for expiring certificates
- **Certificate Generator**: Handles certificate generation (if needed)

### 4. Database (DynamoDB)

#### Certificates Table
- **Partition Key**: `user_id` (String)
- **Sort Key**: `certificate_id` (String)
- **Attributes**:
  - `domain_name` (String)
  - `expiry_date` (String, ISO format)
  - `status` (String: "active"|"expired"|"expiring_soon")
  - `created_at` (String, ISO format)
  - `metadata` (Map)

## Data Flow

1. User interacts with the React frontend
2. Frontend makes authenticated API calls to API Gateway
3. API Gateway routes requests to appropriate Lambda function
4. Lambda function processes the request and interacts with DynamoDB
5. Response is sent back through the same chain

## Security

- All communications are encrypted in transit (HTTPS)
- IAM roles control access between services
- Fine-grained DynamoDB access policies
- Environment variables for sensitive configuration
- API keys for frontend-backend authentication

## Cost Optimization

- Pay-per-use pricing for Lambda and API Gateway
- Auto-scaling based on demand
- Free tier covers most development and testing needs
- Monitoring and alerts for unexpected usage
