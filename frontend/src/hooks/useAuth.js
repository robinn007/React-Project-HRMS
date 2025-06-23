// frontend/src/hooks/useAuth.js
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  console.log("useAuth: Context value:", {
    user: context.user,
    loading: context.loading,
    isAuthenticated: context.isAuthenticated,
  });
  return context;
};

export default useAuth;