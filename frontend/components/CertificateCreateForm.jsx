import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCertificate } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function CertificateCreateForm() {
  const [form, setForm] = useState({
    domain_name: '',
    common_name: '',
    issuer: '',
    valid_from: new Date().toISOString().split('T')[0], // Today's date as default
    valid_until: ''
  });

  // Calculate valid_until when valid_from changes
  useEffect(() => {
    if (form.valid_from) {
      const oneYearLater = new Date(form.valid_from);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setForm(prev => ({
        ...prev,
        valid_until: oneYearLater.toISOString().split('T')[0]
      }));
    }
  }, [form.valid_from]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Logging function calls and state
  const log = (msg, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CertificateCreateForm] ${msg}`, ...args);
    }
  };
  
  // Calculate one year from a given date
  const getOneYearLater = (dateStr) => {
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    log('handleChange', name, value);
    
    // If valid_from changes, update valid_until to be 1 year later
    if (name === 'valid_from' && value) {
      const newValidUntil = getOneYearLater(value);
      setForm(prev => ({
        ...prev,
        [name]: value,
        valid_until: newValidUntil
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    log('handleSubmit', form);
    setError('');
    setLoading(true);
    
    try {
      // Prepare the payload with proper date formatting
      const payload = {
        domain_name: form.domain_name.trim(),
        common_name: form.common_name.trim(),
        issuer: form.issuer.trim(),
        valid_from: form.valid_from ? new Date(form.valid_from + 'T00:00:00Z').toISOString() : '',
        valid_until: form.valid_until ? new Date(form.valid_until + 'T23:59:59Z').toISOString() : ''
      };
      
      log('Submitting payload', payload);
      const result = await createCertificate(payload);
      log('createCertificate result', result);
      
      // Redirect to home page on success
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create certificate';
      log('createCertificate error', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Certificate</h1>
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </Link>
        </div>
        
        {error && <div className="mb-6 p-3 bg-red-900/80 text-red-100 rounded-md text-base">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="domain_name" className="block font-medium text-gray-300 mb-1.5 text-base">
              Domain Name *
            </label>
            <input
              type="text"
              id="domain_name"
              name="domain_name"
              value={form.domain_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base p-2.5 transition-colors"
              placeholder="example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="common_name" className="block font-medium text-gray-300 mb-1.5 text-base">
              Common Name (CN) *
            </label>
            <input
              type="text"
              id="common_name"
              name="common_name"
              value={form.common_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base p-2.5 transition-colors"
              placeholder="*.example.com"
              required
            />
            <p className="mt-1.5 text-sm text-gray-400">Typically matches domain name or uses wildcard</p>
          </div>

          <div>
            <label htmlFor="issuer" className="block font-medium text-gray-300 mb-1.5 text-base">
              Issuer *
            </label>
            <select
              id="issuer"
              name="issuer"
              value={form.issuer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base p-2.5 transition-colors"
              required
            >
              <option value="" className="bg-gray-800">Select an issuer</option>
              <option value="Let's Encrypt" className="bg-gray-800">Let's Encrypt</option>
              <option value="DigiCert" className="bg-gray-800">DigiCert</option>
              <option value="Sectigo" className="bg-gray-800">Sectigo</option>
              <option value="Custom CA" className="bg-gray-800">Custom CA</option>
              <option value="Self-Signed" className="bg-gray-800">Self-Signed</option>
            </select>
          </div>

          <div>
            <label htmlFor="valid_from" className="block font-medium text-gray-300 mb-1.5 text-base">
              Valid From *
            </label>
            <input
              type="date"
              id="valid_from"
              name="valid_from"
              value={form.valid_from}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base p-2.5 transition-colors"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label htmlFor="valid_until" className="block font-medium text-gray-300 mb-1.5 text-base">
              Valid Until *
            </label>
            <input
              type="date"
              id="valid_until"
              name="valid_until"
              value={form.valid_until}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base p-2.5 transition-colors"
              required
              min={form.valid_from}
            />
            <p className="mt-1.5 text-sm text-gray-400">Automatically set to 1 year from Valid From</p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Link
              to="/"
              className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 transition-colors ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
