// frontend/src/components/dashboard/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { Search, Users, Building2, UserCheck, Calendar, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import './Sidebar.css';

const Sidebar = ({ activeItem, setActiveItem }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'candidates', label: 'Candidates', icon: Users, category: 'recruitment' },
    { id: 'employees', label: 'Employees', icon: Building2, category: 'organization' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, category: 'organization' },
    { id: 'leaves', label: 'Leaves', icon: Calendar, category: 'organization' },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo">
          <div className="logo-icon"></div>
          <span className="logo-text">HRMS</span>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Search" className="search-input" />
        </div>
      </div>

      <div className="menu-sections">
        <div className="menu-category">
          <div className="category-header">Recruitment</div>
          {menuItems
            .filter((item) => item.category === 'recruitment')
            .map((item) => (
              <div
                key={item.id}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <item.icon className="menu-icon" size={16} />
                <span className="menu-label">{item.label}</span>
              </div>
            ))}
        </div>

        <div className="menu-category">
          <div className="category-header">Organization</div>
          {menuItems
            .filter((item) => item.category === 'organization')
            .map((item) => (
              <div
                key={item.id}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <item.icon className="menu-icon" size={16} />
                <span className="menu-label">{item.label}</span>
              </div>
            ))}
        </div>

        <div className="menu-category">
          <div className="category-header">Others</div>
          <div className="menu-item logout-item" onClick={handleLogout}>
            <LogOut className="menu-icon" size={16} />
            <span className="menu-label">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;