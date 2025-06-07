import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Certificate Manager</h3>
            <p className="text-text-secondary text-sm">
              Secure and manage your SSL/TLS certificates with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-text-secondary hover:text-text-inverse transition-colors">Home</Link></li>
              <li><Link to="/certificates" className="text-text-secondary hover:text-text-inverse transition-colors">Certificates</Link></li>
              <li><Link to="/settings" className="text-text-secondary hover:text-text-inverse transition-colors">Settings</Link></li>
              <li><Link to="/help" className="text-text-secondary hover:text-text-inverse transition-colors">Help</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>Email: support@certmanager.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>123 Security St, Webville</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-text-inverse transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-text-secondary hover:text-text-inverse transition-colors" aria-label="GitHub">
                <i className="fab fa-github text-xl"></i>
              </a>
              <a href="#" className="text-text-secondary hover:text-text-inverse transition-colors" aria-label="LinkedIn">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-primary-700 mt-8 pt-6 text-center text-text-secondary text-sm">
          <p>&copy; {currentYear} Certificate Manager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}