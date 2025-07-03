import { Home, Users, CalendarDays, FileText, BarChart2, User, LogOut } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: Home, link: '/hr/dashboard' },
  { name: 'Employee', icon: Users, link: '/hr/employee', matchPrefix: '/hr/employee' },
  { name: 'Attendance', icon: CalendarDays, link: '/hr/attendance' },
  { name: 'Calendar', icon: CalendarDays, link: '/hr/calendar' },
  { name: 'Leave', icon: FileText, link: '/hr/leave' },
  { name: 'Reports', icon: BarChart2, link: '/hr/reports' , matchPrefix: '/hr/reports' },
  { name: 'Profile', icon: User, link: '/hr/profile' },
  // Remove the link from Logout, will handle logout on click
  { name: 'Logout', icon: LogOut }
];


export default function Sidebar({ sidebarOpen, closeSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  // New logout handler
  const handleLogout = () => {
    // Clear localStorage keys related to auth
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    // Redirect to login page
    navigate('/login', { replace: true });
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div
      className={
        "fixed inset-y-0 left-0 w-64 bg-white shadow-md p-4 space-y-2 transform transition-transform duration-300 " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
        " md:translate-x-0"
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
              className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition text-gray-700 hover:text-blue-600 w-full text-left`}
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
