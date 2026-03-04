import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Loader } from './loader/loader';

export const ProtectedRoute = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

