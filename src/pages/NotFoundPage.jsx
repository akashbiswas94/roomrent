import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1 className="not-found__title">Page Not Found</h1>
      <p className="not-found__subtitle">The page you're looking for doesn't exist.</p>
      <button className="btn btn--primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

export default NotFoundPage;
