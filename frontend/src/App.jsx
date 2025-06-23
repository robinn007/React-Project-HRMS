// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
         <Route path="/auth/:type" element={<AuthPage />} />  
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;