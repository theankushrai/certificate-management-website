import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationPopup from './NotificationPopup';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:bg-primary-600 px-3 py-2 rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            <span className="text-xl font-bold">Certificate Manager</span>
          </Link>
          <Link to="/notifications" className="relative">
            <NotificationPopup />
          </Link>
        </div>
      </div>
    </nav>
  );
}