import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { getCertificates, deleteCertificate, rotateCertificate, getCertificate } from '../services/api';
import { Link } from 'react-router-dom';
import CertificateViewModal from './CertificateViewModal';


// Status colors now directly in the component using Tailwind config colors
// Using primary, secondary, success, warning, error, dark, light from config

export default function CertificateTable() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which certificates are being rotated to prevent double rotate
  const [rotating, setRotating] = useState({});
  // Track which certificate is being viewed
  const [viewingCertificateId, setViewingCertificateId] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await getCertificates();
      console.log('[CertificateTable] Raw response from getCertificates:', response); // Log the raw response
      setCertificates(response.data || []); // 'response' is an object like { data: [...] }, so we need response.data
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

  // Add this new useEffect to log the state when it changes
  useEffect(() => {
    console.log('[CertificateTable] Certificates state updated:', certificates);
  }, [certificates]);

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


  console.log('[CertificateTable] Rendering with certificates:', certificates);
  if (loading) {
    return <div className="p-6">Loading certificates...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-2xl font-bold text-white">Certificates</h2>
          <Link
            to="/certificates/new"
            className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
            <span className="hidden sm:inline">Create New</span>
          </Link>
        </div>

        {/* Certificate View Modal */}
        {viewingCertificateId && (
          <CertificateViewModal 
            certificateId={viewingCertificateId}
            onClose={() => setViewingCertificateId(null)}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Common Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Issuer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fingerprint
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {certificates.length > 0 ? (
                certificates.map((cert) => {
                  console.log('[CertificateTable] Mapping cert:', cert, 'using ID:', cert.certificate_id);
                  return (
                    <tr key={cert.certificate_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {cert.domain_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {cert.common_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {cert.issuer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cert.status === 'active' ? 'bg-success text-white' :
                          cert.status === 'expired' ? 'bg-error text-white' :
                          'bg-warning text-white'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono truncate max-w-xs">
                        {cert.fingerprint_sha256 ? `${cert.fingerprint_sha256.substring(0, 12)}...` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(cert.valid_until).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            className="text-secondary-400 hover:text-secondary-300 transition-colors"
                            title="View Details"
                            onClick={() => setViewingCertificateId(cert.certificate_id)}
                          >
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          </button>
                          <button
                            className={`text-success hover:text-success-300 transition-colors ${rotating[cert.certificate_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Rotate"
                            onClick={() => handleRotate(cert.certificate_id)}
                            disabled={rotating[cert.certificate_id]}
                          >
                            <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                            onClick={() => handleDelete(cert.certificate_id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
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
