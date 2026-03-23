import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiShield,
  FiX,
} from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
    { path: '/opportunities', icon: FiBriefcase, label: 'Opportunities', roles: ['all'] },
    { path: '/mentorship', icon: FiUsers, label: 'Mentorship', roles: ['all'] },
    { path: '/messages', icon: FiMessageSquare, label: 'Messages', roles: ['all'] },
    { path: '/profile', icon: FiUser, label: 'Profile', roles: ['all'] },
    { path: '/admin', icon: FiShield, label: 'Admin Panel', roles: ['admin'] },
    { path: '/settings', icon: FiSettings, label: 'Settings', roles: ['all'] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 lg:hidden"
        >
          <FiX size={24} />
        </button>

        {/* Menu items */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
