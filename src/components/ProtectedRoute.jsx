import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { Loader } from './loader/loader';

export const ProtectedRoute = () => {
  const { user, initializing, isLocalMode } = useAuth();
  const { pathname } = useLocation();

  if (initializing) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLocalMode && /^\/(users|add-user|edit-user)(\/|$)/.test(pathname)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

