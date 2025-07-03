import {
  Home,
  Users,
  CalendarDays,
  FileText,
  BarChart2,
  User,
  LogOut,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: Home, link: '/admin/dashboard' },
  { name: 'Employee', icon: Users, link: '/admin/employee', matchPrefix: '/admin/employee' },
  { name: 'Attendance', icon: CalendarDays, link: '/admin/attendance' },
  { name: 'Calendar', icon: CalendarDays, link: '/admin/calendar' },
  { name: 'Leave', icon: FileText, link: '/admin/leave' },
  { name: 'Payroll', icon: FileText, link: '/admin/payroll' },
  { name: 'Reports', icon: BarChart2, link: '/admin/reports', matchPrefix: '/admin/reports' },
  { name: 'Profile', icon: User, link: '/admin/profile' },
  { name: 'Logout', icon: LogOut, link: '/logout' }, // This will be handled separately
];


export default function Sidebar({ sidebarOpen, closeSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div
      className={
        'fixed inset-y-0 left-0 w-64 bg-white shadow-md p-4 space-y-2 transform transition-transform duration-300 z-40 ' +
        (sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
        ' md:translate-x-0'
      }
    >
      {navItems.map(({ name, icon: Icon, link, matchPrefix }) => {
        const isActive = matchPrefix
          ? location.pathname.startsWith(matchPrefix)
          : location.pathname === link;

        if (name === 'Logout') {
          return (
            <button
              key={name}
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded font-medium text-gray-700 hover:text-red-600 transition w-full text-left"
            >
              <Icon size={18} />
              {name}
            </button>
          );
        }

        return (
          <Link
            key={name}
            to={link}
            onClick={handleClick}
            className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <Icon size={18} />
            {name}
          </Link>
        );
      })}
    </div>
  );
}
