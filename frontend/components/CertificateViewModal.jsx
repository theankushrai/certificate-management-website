import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { getCertificate } from "../services/api";
import { useTheme } from '../src/contexts/ThemeContext';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'expired':
      return 'danger';
    default:
      return 'warning';
  }
};

export default function CertificateViewModal({ certificateId, onClose }) {
  const { isDarkMode } = useTheme();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;

    const fetchCertificate = async () => {
      setIsLoading(true);
      setError(null);
      setCertificate(null);
      try {
        const response = await getCertificate(certificateId);
        setCertificate(response.data);
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError('Failed to load certificate details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (certificate) {
      return (
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5>Basic Information</h5>
            <p className="mb-2">
              <span className="d-block text-muted small">Domain</span>
              <span className="d-block">{certificate.domain_name || 'N/A'}</span>
            </p>
            <p className="mb-2">
              <span className="d-block text-muted small">Common Name</span>
              <span className="d-block">{certificate.common_name || 'N/A'}</span>
            </p>
            <p className="mb-2">
              <span className="d-block text-muted small">Issuer</span>
              <span className="d-block">{certificate.issuer || 'N/A'}</span>
            </p>
            <p className="mb-0">
              <span className="d-block text-muted small">Status</span>
              <span className="d-block">
                <Badge bg={getStatusBadge(certificate.status)} className="text-capitalize">
                  {certificate.status}
                </Badge>
              </span>
            </p>
          </Col>
          <Col md={6}>
            <h5>Validity</h5>
            <p className="mb-2">
              <span className="d-block text-muted small">Valid From</span>
              <span className="d-block">{formatDate(certificate.valid_from)}</span>
            </p>
            <p className="mb-2">
              <span className="d-block text-muted small">Valid Until</span>
              <span className="d-block">{formatDate(certificate.valid_until)}</span>
            </p>
            <div className="mt-3">
              <h5>Fingerprint (SHA-256)</h5>
              <p className="font-monospace text-break bg-light bg-opacity-10 p-2 rounded" style={{ fontSize: '0.875rem' }}>
                {certificate.fingerprint_sha256 || 'N/A'}
              </p>
            </div>
          </Col>
        </Row>
      );
    }

    return null;
  };

  return (
    <Modal 
      show={!!certificateId} 
      onHide={onClose} 
      centered 
      size="lg"
      data-bs-theme={isDarkMode ? 'dark' : 'light'}
      className={isDarkMode ? 'bg-dark text-light' : ''}
    >
      <Modal.Header 
        closeButton 
        closeVariant={isDarkMode ? 'white' : undefined}
        className={isDarkMode ? 'bg-dark border-secondary' : ''}
      >
        <Modal.Title>Certificate Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className={isDarkMode ? 'bg-dark' : ''}>
        {renderBody()}
      </Modal.Body>
      <Modal.Footer className={isDarkMode ? 'bg-dark border-secondary' : ''}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
