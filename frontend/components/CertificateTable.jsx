import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

// Mock data - replace with actual data from API
const certificates = [
  {
    id: 1,
    name: 'Example.com Certificate',
    domain: 'example.com',
    issuer: 'Let\'s Encrypt',
    status: 'active',
    expiry: '2025-07-01',
    daysLeft: 30,
    type: 'TLS'
  },
  {
    id: 2,
    name: 'Test Site Certificate',
    domain: 'testsite.com',
    issuer: 'GlobalSign',
    status: 'expired',
    expiry: '2023-06-01',
    daysLeft: -390,
    type: 'TLS'
  },
  {
    id: 3,
    name: 'API Certificate',
    domain: 'api.example.com',
    issuer: 'DigiCert',
    status: 'warning',
    expiry: '2024-06-01',
    daysLeft: 90,
    type: 'TLS'
  }
];

export default function CertificateTable() {
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-default divide-y divide-gray-200">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {cert.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {cert.domain}
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
                    {new Date(cert.expiry).toLocaleDateString()} ({cert.daysLeft} days)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-primary-500 hover:text-primary-600 transition-colors"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-success hover:text-success-dark transition-colors"
                        title="Rotate"
                      >
                        <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-error hover:text-error-dark transition-colors"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-success text-white';
    case 'warning':
      return 'bg-warning text-white';
    case 'expired':
      return 'bg-error text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}