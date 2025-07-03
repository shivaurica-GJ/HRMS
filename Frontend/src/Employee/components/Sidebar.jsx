import {
  Home,
  BarChart2,
  User,
  LogOut,
  CalendarDays
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: Home, link: '/employee/dashboard' },
  { name: 'Calendar', icon: CalendarDays, link: '/employee/calendar' },
  { name: 'Reports', icon: BarChart2, link: '/employee/reports' },
  { name: 'Profile', icon: User, link: '/employee/profile' },
  { name: 'Logout', icon: LogOut, link: '/logout' } // handled separately
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: '', designation: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employee/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setUser({
            fullName: data.fullName || 'User',
            designation: data.designation || 'Employee'
          });
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <aside className="fixed w-64 bg-white h-screen shadow-md p-4 space-y-2 border-r border-gray-200">
      {navItems.map(({ name, icon: Icon, link }) => {
        const isActive = location.pathname === link;

        if (name === 'Logout') {
          return (
            <button
              key={name}
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition"
            >
              <Icon size={20} className="text-gray-500" />
              <span>{name}</span>
            </button>
          );
        }

        return (
          <Link
            key={name}
            to={link}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
            <span>{name}</span>
          </Link>
        );
      })}

      {/* Profile section at bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="flex items-center justify-center gap-3 p-3 border-t border-gray-200">
          {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" /> */}
          <div>
            <p className="font-medium text-gray-800">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.designation}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
