import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('isAuthenticated');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">Stock Keeper</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive('/')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/items"
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive('/items')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Items
                </Link>
                <Link
                  href="/vendors"
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive('/vendors')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Vendors
                </Link>
                <Link
                  href="/stock-records"
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive('/stock-records')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Stock Records
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
