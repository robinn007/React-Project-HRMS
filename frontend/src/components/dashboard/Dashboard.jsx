
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import CandidatesPage from  './CandidatesPage/CandidatesPage.jsx'
import './Dashboard.css';
import EmployeePage from './EmployeePage.jsx';
import AttendancePage from './AttendancePage.jsx';
import LeavesPage from './LeavesPage.jsx';

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState('candidates');

  const renderContent = () => {
    switch (activeItem) {
      case 'candidates':
        return <CandidatesPage />
      case 'employees':
          return <EmployeePage/>
      case 'attendance':
        return <AttendancePage/>
      case 'leaves':
        return <LeavesPage/>
        return (
          <div className="main-content">
            <div className="header">
              <h1 className="page-title">{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}</h1>
            </div>
            <div className="content-area">
              <p>Content for {activeItem} page will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      {renderContent()}
    </div>
  );
};

export default Dashboard;