import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <i className="ri-shield-cross-line text-4xl text-red-600"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          {user
            ? `Your account doesn't have permission to view this page. Ask your Admin to grant access.`
            : `You don't have permission to view this page.`}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer"
          >
            <i className="ri-home-4-line mr-2"></i>
            Go to Home
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
            >
              <i className="ri-logout-box-line mr-2"></i>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
