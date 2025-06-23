// frontend/src/components/common/Navbar.jsx
import useAuth from '../../hooks/useAuth.js';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <h1 className="navbar-title">HRMS Dashboard</h1>
      <div className="navbar-user">
        {/* <span className="navbar-user-text">
          Welcome, {user?.name} ({user?.role})
        </span> */}

         <span className="navbar-user-text">
          Welcome, {user?.name}
        </span>
        <button onClick={logout} className="navbar-logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;