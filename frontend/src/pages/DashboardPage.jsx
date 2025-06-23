// frontend/src/pages/DashboardPage.jsx
import Navbar from '../components/common/Navbar.jsx';
import Dashboard from '../components/dashboard/Dashboard.jsx';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
         <div className='dashboard-hero'>
          <Dashboard />
         </div>
      </main>
    </div>
  );
};

export default DashboardPage;