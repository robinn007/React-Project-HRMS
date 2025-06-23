// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Page not found</p>
      <Link to="/" className="not-found-link">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;