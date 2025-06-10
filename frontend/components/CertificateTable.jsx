import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Badge, Spinner, Row, Col, ButtonGroup } from 'react-bootstrap';
import { Plus, ArrowClockwise, Trash, Eye } from 'react-bootstrap-icons';
import { getCertificates, deleteCertificate, rotateCertificate } from "../services/api";
import CertificateViewModal from "./CertificateViewModal";
import { useTheme } from "../src/contexts/ThemeContext";

export default function CertificateTable() {
  const { isDarkMode } = useTheme();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState({});
  const [viewingCertificateId, setViewingCertificateId] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await getCertificates();
      setCertificates(response.data || []);
    } catch (err) {
      console.error(err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await deleteCertificate(id);
        fetchCertificates();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRotate = async (id) => {
    if (rotating[id]) return;
    if (window.confirm('Are you sure you want to rotate this certificate?')) {
      setRotating((prev) => ({ ...prev, [id]: true }));
      try {
        await rotateCertificate(id);
        fetchCertificates();
      } catch (err) {
        console.error('Error rotating certificate:', err);
      } finally {
        setRotating((prev) => ({ ...prev, [id]: false }));
      }
    }
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading certificates...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Card 
        className="shadow-sm" 
        style={{ backgroundColor: 'var(--app-card-bg)' }}
        text={isDarkMode ? 'light' : 'dark'}
      >
        <Card.Header 
          as="h2" 
          className={`d-flex justify-content-between align-items-center ${isDarkMode ? 'bg-dark' : 'bg-light'} border-0`}
        >
          Certificates
          <Button as={Link} to="/certificates/new" variant="primary">
            <Plus size={20} className="me-2" />
            Create New
          </Button>
        </Card.Header>
        <Card.Body>
          <Table 
            striped 
            bordered 
            hover 
            responsive 
            className="align-middle m-0" 
            variant={isDarkMode ? 'dark' : ''}
          >
            <thead>
              <tr>
                <th>Domain</th>
                <th>Common Name</th>
                <th>Issuer</th>
                <th>Status</th>
                <th>Fingerprint (SHA-256)</th>
                <th>Valid Until</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <tr key={cert.certificate_id}>
                    <td>{cert.domain_name}</td>
                    <td>{cert.common_name}</td>
                    <td>{cert.issuer}</td>
                    <td>
                      <Badge bg={getStatusBadge(cert.status)} className="text-capitalize">
                        {cert.status}
                      </Badge>
                    </td>
                    <td className="font-monospace">
                      {cert.fingerprint_sha256 ? (
                        <span className="text-nowrap">
                          {cert.fingerprint_sha256.substring(0, 12)}...
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>{new Date(cert.valid_until).toLocaleDateString()}</td>
                    <td className="text-center">
                      <ButtonGroup aria-label="Certificate Actions">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          title="View Details"
                          onClick={() => setViewingCertificateId(cert.certificate_id)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          title="Rotate"
                          onClick={() => handleRotate(cert.certificate_id)}
                          disabled={rotating[cert.certificate_id]}
                        >
                          {rotating[cert.certificate_id] ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          ) : (
                            <ArrowClockwise />
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(cert.certificate_id)}
                        >
                          <Trash />
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {viewingCertificateId && (
        <CertificateViewModal
          certificateId={viewingCertificateId}
          onClose={() => setViewingCertificateId(null)}
        />
      )}
    </>
  );
}
