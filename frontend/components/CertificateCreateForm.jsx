import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCertificate } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function CertificateCreateForm() {
  const [form, setForm] = useState({
    domain_name: '',
    common_name: '',
    issuer: '',
    valid_until: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Logging function calls and state
  const log = (msg, ...args) => {
    console.log(`[CertificateCreateForm] ${msg}`, ...args);
  };

  const handleChange = (e) => {
    log('handleChange', e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    log('handleSubmit', form);
    setError('');
    setLoading(true);
    try {
      // Convert valid_until (yyyy-mm-dd) to ISO datetime string for backend compatibility
      const payload = {
        ...form,
        valid_until: form.valid_until ? new Date(form.valid_until + 'T23:59:59Z').toISOString() : ''
      };
      log('Submitting payload', payload);
      const result = await createCertificate(payload);
      log('createCertificate result', result);
      navigate('/');
    } catch (err) {
      log('createCertificate error', err);
      setError(err.response?.data?.message || err.message || 'Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold text-text-primary">Create New Certificate</h2>
          <Link
            to="/"
            className="bg-error hover:bg-error-dark text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Link>
        </div>
        {error && <div className="mb-4 text-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-text-secondary font-medium">Domain Name</label>
              <input
                type="text"
                name="domain_name"
                value={form.domain_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block mb-1 text-text-secondary font-medium">Common Name</label>
              <input
                type="text"
                name="common_name"
                value={form.common_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-text-secondary font-medium">Issuer</label>
              <input
                type="text"
                name="issuer"
                value={form.issuer}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-text-secondary font-medium">Valid Until</label>
              <input
                type="date"
                name="valid_until"
                value={form.valid_until}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end mt-8">
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Certificate'}</span>
            </button>
            <Link
              to="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              <span>Cancel</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
