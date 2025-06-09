import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white shadow-lg px-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center h-16">
        <div className="text-center">
          <span className="text-xl font-bold tracking-tight">Certificate Manager</span>
        </div>
      </div>
    </nav>
  );
}