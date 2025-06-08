class Certificate:
    """Certificate model to represent SSL/TLS certificates"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.domain_name = kwargs.get('domain_name')
        self.common_name = kwargs.get('common_name')
        self.issuer = kwargs.get('issuer')
        self.valid_from = kwargs.get('valid_from')
        self.valid_until = kwargs.get('valid_until')
        self.status = kwargs.get('status', 'active')  # active, expired, revoked
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
    
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
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    #convert json into dictionary
    @classmethod
    def from_dict(cls, data):
        """Create Certificate from dictionary"""
        return cls(**data)