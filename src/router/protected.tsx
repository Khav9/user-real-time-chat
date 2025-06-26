import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hook/useAuth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check sessionStorage directly for immediate auth check
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = !!sessionStorage.getItem("auth_token");
      if (hasToken && !isAuthenticated) {
        // If we have a token but auth state says not authenticated,
        // give it a moment to sync
        setTimeout(() => setIsChecking(false), 50);
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check both auth state and sessionStorage
  const hasToken = !!sessionStorage.getItem("auth_token");
  if (!isAuthenticated && !hasToken) {
    // Redirect to login page with the current location as state
    // This allows us to redirect back to the original page after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
