import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { getCertificates, deleteCertificate, rotateCertificate } from '../services/api';
import { Link } from 'react-router-dom';


function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-success text-white';
    case 'expired':
      return 'bg-error text-white';
    case 'warning':
      return 'bg-warning text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}

export default function CertificateTable() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which certificates are being rotated to prevent double rotate
  const [rotating, setRotating] = useState({});

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

  // Prevent double rotate by tracking loading state per cert
  const handleRotate = async (id) => {
    console.log('[CertificateTable] handleRotate called with id:', id);
    if (rotating[id]) return; // Already rotating
    if (window.confirm('Are you sure you want to rotate this certificate?')) {
      setRotating(prev => ({ ...prev, [id]: true }));
      try {
        const result = await rotateCertificate(id);
        console.log('[CertificateTable] rotateCertificate result:', result);
        fetchCertificates();
      } catch (err) {
        console.error('[CertificateTable] rotateCertificate error:', err);
      } finally {
        setRotating(prev => ({ ...prev, [id]: false }));
      }
    }
  };


  if (loading) {
    return <div className="p-6">Loading certificates...</div>;
  }

  return (
    <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold text-text-primary">Certificates</h2>
          <Link
            to="/certificates/new"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
            <span className="hidden sm:inline">Create New</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-bg-default">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Common Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-default divide-y divide-gray-200">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {cert.domain_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {cert.common_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {cert.issuer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(cert.valid_until).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-primary-500 hover:text-primary-600 transition-colors"
                          title="View Details"
                          onClick={() => {/* View details */}}
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        </button>
                        <button
                          className={`text-success hover:text-success-dark transition-colors ${rotating[cert.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Rotate"
                          onClick={() => handleRotate(cert.id)}
                          disabled={rotating[cert.id]}
                        >
                          <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
                        </button>
                        <button
                          className="text-error hover:text-error-dark transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(cert.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-text-secondary">
                    No certificates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
