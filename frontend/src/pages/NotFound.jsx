import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container text-center py-5" style={{ marginTop: '10%' }}>
      <h1 className="display-1 text-success fw-bold">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="text-muted mb-4">The page you are looking for might have been removed or is temporarily unavailable.</p>
      <Link to="/" className="btn btn-success px-4 py-2">
        Go to Homepage
      </Link>
    </div>
  );
}
