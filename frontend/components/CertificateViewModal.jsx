import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';import { getCertificate } from '../services/api';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function CertificateViewModal({ certificateId, onClose }) {
  const [certificate, setCertificate] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // Fetch certificate details
  useEffect(() => {
    if (!certificateId) return;
    
    const fetchCertificate = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const response = await getCertificate(certificateId);
        setCertificate(response.data);
        // Only show the modal after we have the data
        setIsVisible(true);
      } catch (error) {
        console.error('Error fetching certificate:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
    
    return () => {
      // Clean up when component unmounts or certificateId changes
      setIsVisible(false);
    };
  }, [certificateId]);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  // Don't render anything until we have data or an error
  if (!isVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Loading Certificate</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-300">Loading certificate details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !certificate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Error</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center py-8 text-gray-300">
            Failed to load certificate details. Please try again.
          </div>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-base"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Certificate Details</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-800 rounded-lg">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Domain Name</h3>
                  <p className="mt-1 text-sm text-gray-200">{certificate.domain_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Common Name</h3>
                  <p className="mt-1 text-sm text-gray-200">{certificate.common_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Issuer</h3>
                  <p className="mt-1 text-sm text-gray-200">{certificate.issuer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Fingerprint (SHA-256)</h3>
                  <p className="mt-1 text-sm font-mono text-gray-300 break-all">
                    {certificate.fingerprint_sha256}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    certificate.status === 'active' ? 'bg-green-900 text-green-200' :
                    certificate.status === 'expired' ? 'bg-red-900 text-red-200' :
                    'bg-yellow-900 text-yellow-200'
                  }`}>
                    {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Valid From</h3>
                  <p className="mt-1 text-sm text-gray-200">{formatDate(certificate.valid_from)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Valid Until</h3>
                  <p className="mt-1 text-sm text-gray-200">{formatDate(certificate.valid_until)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Validity Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Issued On</p>
                <p className="text-sm text-gray-200">{formatDate(certificate.valid_from)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Expires On</p>
                <p className="text-sm text-gray-200">{formatDate(certificate.valid_until)}</p>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Certificate Details</h3>
            <div className="bg-gray-700 p-4 rounded-md">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-300">Serial Number</p>
                  <p className="font-mono text-sm break-all text-gray-200">{certificate.id || 'N/A'}</p>
                </div>
                {certificate.updated_at && (
                  <div>
                    <p className="text-sm text-gray-300">Last Updated</p>
                    <p className="text-sm text-gray-200">{formatDate(certificate.updated_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
