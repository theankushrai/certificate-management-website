import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationPopup from './NotificationPopup';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-500 text-white shadow-lg px-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center space-x-1 ml-1">
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xl font-bold">Certificate Manager</span>
        </div>
        <div className="flex items-center justify-end">
          <Link to="/notifications" className="relative">
            <NotificationPopup />
          </Link>
        </div>
      </div>
    </nav>
  );
}