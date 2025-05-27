import React from 'react';
import { Link } from 'react-router-dom';

function NewUserForm() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Welcome!</h2>
      <p>It looks like you're new here or your account isn't fully set up yet.</p>
      <p>Please complete your registration to continue.</p>
      {/* Add your form elements or registration steps here later */}
    </div>
  );
}

export default NewUserForm;