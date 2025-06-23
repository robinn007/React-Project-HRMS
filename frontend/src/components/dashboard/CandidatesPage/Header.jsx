// frontend/src/components/dashboard/CandidatesPage/Header.jsx
import { Mail, Bell, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './CandidatesPage.module.css';

/**
 * Header component for the page
 * @component
 */
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (action) => {
    console.log(`${action} clicked`);
    setIsDropdownOpen(false);
    // Add your navigation/action logic here
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>Candidates</h1>
      </div>
      <div className={styles.headerRight}>
        <Mail className={styles.headerIcon} size={20} aria-label="Messages" />
        <div className={styles.notificationIcon}>
          <Bell size={20} aria-label="Notifications" />
          <span className={styles.notificationBadge}></span>
        </div>
        <div className={styles.userProfile} ref={dropdownRef}>
          <div className={styles.userProfileButton} onClick={toggleDropdown}>
            <img
              src="https://images.unsplash.com/photo-1747491681738-d0ed9a30fed3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="User avatar"
              className={styles.userAvatar}
            />
            <ChevronDown 
              size={16} 
              className={`${styles.userDropdown} ${isDropdownOpen ? styles.rotated : ''}`} 
            />
          </div>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItem} onClick={() => handleMenuItemClick('Edit Profile')}>
                Edit Profile
              </div>
              <div className={styles.dropdownItem} onClick={() => handleMenuItemClick('Change Password')}>
                Change Password
              </div>
              <div className={styles.dropdownItem} onClick={() => handleMenuItemClick('Manage Notification')}>
                Manage Notification
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;