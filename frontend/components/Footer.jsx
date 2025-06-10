import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Github, Twitter, Linkedin } from 'react-bootstrap-icons';
import { useTheme } from '../src/contexts/ThemeContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { isDarkMode } = useTheme();

  return (
    <footer 
      className={`mt-auto py-3 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
      style={{
        borderTop: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
        color: isDarkMode ? '#adb5bd' : '#6c757d'
      }}
    >
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <small>&copy; {currentYear} Certificate Manager. All rights reserved.</small>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a href="https://github.com/theankushrai/certificate-management-website" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
              <Github size={20} className={isDarkMode ? 'text-light' : 'text-muted'} />
            </a>
            <a href="https://twitter.com/theankushrai" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
              <Twitter size={20} className={isDarkMode ? 'text-light' : 'text-muted'} />
            </a>
            <a href="https://linkedin.com/in/theankushrai" target="_blank" rel="noopener noreferrer" className="text-muted">
              <Linkedin size={20} className={isDarkMode ? 'text-light' : 'text-muted'} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}