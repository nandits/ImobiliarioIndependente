import React from 'react';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page, or your account is not configured for this access.</p>
      <Link to="/login">Go to Login</Link>
    </div>
  );
}

export default UnauthorizedPage;