import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { XLg } from 'react-bootstrap-icons';
import { createCertificate } from "../services/api";
import { useTheme } from '../src/contexts/ThemeContext';

export default function CertificateCreateForm() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    domain_name: '',
    common_name: '',
    issuer: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // If valid_from is being updated, also update valid_until to be 1 year later
      if (name === 'valid_from' && value) {
        const oneYearLater = new Date(value);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        const formattedDate = oneYearLater.toISOString().split('T')[0];
        
        return {
          ...prev,
          [name]: value,
          valid_until: formattedDate
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await createCertificate(formData);
      navigate('/');
    } catch (err) {
      console.error('Error creating certificate:', err);
      setError(err.response?.data?.message || 'Failed to create certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <Card className="shadow-sm border-0" text={isDarkMode ? 'light' : 'dark'} style={{ backgroundColor: 'var(--app-card-bg)' }}>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Create New Certificate</h4>
              <Button 
                variant="link" 
                className="text-white p-0" 
                onClick={() => navigate('/')}
              >
                <XLg />
              </Button>
            </Card.Header>
            
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="domain_name">
                  <Form.Label>Domain Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="domain_name"
                    value={formData.domain_name}
                    onChange={handleChange}
                    required
                    placeholder="example.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a domain name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="common_name">
                  <Form.Label>Common Name (CN)</Form.Label>
                  <Form.Control
                    type="text"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleChange}
                    placeholder="*.example.com"
                  />
                  <Form.Text className="text-muted">
                    Typically matches domain name or uses wildcard
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="issuer">
                  <Form.Label>Issuer</Form.Label>
                  <Form.Select
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select an issuer</option>
                    <option value="Let's Encrypt">Let's Encrypt</option>
                    <option value="DigiCert">DigiCert</option>
                    <option value="Sectigo">Sectigo</option>
                    <option value="Custom CA">Custom CA</option>
                    <option value="Self-Signed">Self-Signed</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select an issuer.
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="valid_from">
                      <Form.Label>Valid From</Form.Label>
                      <Form.Control
                        type="date"
                        name="valid_from"
                        value={formData.valid_from}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="valid_until">
                      <Form.Label>Valid Until</Form.Label>
                      <Form.Control
                        type="date"
                        name="valid_until"
                        value={formData.valid_until}
                        onChange={handleChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Automatically set to 1 year from Valid From
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      'Create Certificate'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
