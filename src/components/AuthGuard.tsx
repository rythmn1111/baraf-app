import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const authenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // Redirect to login if not authenticated and not already on login page
      if (!authenticated && router.pathname !== '/login') {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login page, always show it
  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise show nothing (will redirect to login)
  return null;
}
