import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import Notification from './Notification';

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Certificate Expiring Soon',
    message: 'The certificate for example.com will expire in 5 days.',
    timestamp: '2025-06-07T12:00:00',
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: 'Certificate Rotation Successful',
    message: 'Successfully rotated the certificate for test.com.',
    timestamp: '2025-06-06T09:30:00',
    read: true
  },
  {
    id: 3,
    type: 'info',
    title: 'New Certificate Request',
    message: 'A new certificate request has been submitted for api.example.com.',
    timestamp: '2025-06-06T15:45:00',
    read: false
  }
];

export default function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleXClick = (e) => {
    e.stopPropagation();
    // Will implement dismiss functionality later
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={togglePopup}
        className="relative p-2 rounded-full hover:bg-primary-600 transition-colors"
      >
        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-md sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
              <button 
                onClick={handleXClick}
                className="text-gray-400 hover:text-gray-500 p-1"
                aria-label="Dismiss notifications"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {mockNotifications.map((notification) => (
              <Notification 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}