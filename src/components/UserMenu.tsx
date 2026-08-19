import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
      >
        <div className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold uppercase">
          {user.username.charAt(0)}
        </div>
        <span className="hidden sm:inline font-medium text-gray-800">{user.username}</span>
        <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-gray-700 text-white uppercase">
          {user.role}
        </span>
        <i className="ri-arrow-down-s-line"></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {user.role === 'admin' && (
            <>
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-dashboard-line"></i>
                Dashboard
              </a>
              <a
                href="/users"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-team-line"></i>
                Users
              </a>
              <a
                href="/backup"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-download-cloud-2-line"></i>
                Backup &amp; Restore
              </a>
              <a
                href="/security"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-shield-keyhole-line"></i>
                Security Settings
              </a>
              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left"
          >
            <i className="ri-logout-box-line"></i>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
