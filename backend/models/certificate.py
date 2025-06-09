from datetime import datetime, timedelta, timezone

class Certificate:
    """Certificate model to represent SSL/TLS certificates"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.domain_name = kwargs.get('domain_name')
        self.common_name = kwargs.get('common_name')
        self.issuer = kwargs.get('issuer')
        self.valid_from = kwargs.get('valid_from')
        self.valid_until = kwargs.get('valid_until')
        self.fingerprint_sha256 = kwargs.get('fingerprint_sha256') or self._generate_fingerprint()
        
    @property
    def status(self):
        """Dynamically determine status based on valid_until date"""
        if not self.valid_until:
            return 'active'
            
        try:
            # Parse the expiry date and make it timezone-aware if it's not
            expiry_date = datetime.fromisoformat(self.valid_until.replace('Z', '+00:00'))
            if expiry_date.tzinfo is None:
                expiry_date = expiry_date.replace(tzinfo=timezone.utc)
                
            # Get current time in UTC with timezone info
            today = datetime.now(timezone.utc)
            warning_threshold = today + timedelta(days=90)
            
            if expiry_date < today:
                return 'expired'
            elif expiry_date < warning_threshold:
                return 'warning'
            return 'active'
        except (ValueError, AttributeError) as e:
            print(f"Error determining certificate status: {e}")
            return 'active'
    
    def _generate_fingerprint(self):
        """Generate a SHA-256 fingerprint for the certificate"""
        import hashlib
        import secrets
        # Create a unique string from certificate data and a random component
        unique_str = f"{self.domain_name}:{self.common_name}:{self.issuer}:{secrets.token_hex(8)}"
        return hashlib.sha256(unique_str.encode()).hexdigest()
    
    def to_dict(self):
        """Convert certificate object to dictionary"""
        return {
            'id': self.id,
            'domain_name': self.domain_name,
            'common_name': self.common_name,
            'issuer': self.issuer,
            'valid_from': self.valid_from,
            'valid_until': self.valid_until,
            'status': self.status,
            'fingerprint_sha256': self.fingerprint_sha256
        }
    #convert json into dictionary
    @classmethod
    def from_dict(cls, data):
        """Create Certificate from dictionary"""
        return cls(**data)