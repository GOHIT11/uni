import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, Users, ShoppingBag, Briefcase, UserPlus, MessageSquare, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Feed', path: '/dashboard', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Teammates', path: '/teammates', icon: UserPlus },
    { name: 'UniBot', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
            UniCampus
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className={`p-2 rounded-full hover:bg-dark-800 transition-colors ${pathname === '/notifications' ? 'text-primary-400' : 'text-dark-400'}`}>
              <Bell className="w-5 h-5" />
            </Link>
            <Link to="/settings" className={`p-2 rounded-full hover:bg-dark-800 transition-colors ${pathname === '/settings' ? 'text-primary-400' : 'text-dark-400'}`}>
              <Settings className="w-5 h-5" />
            </Link>
            <Link to={`/u/${user?.email.split('@')[0]}`} className="w-8 h-8 rounded-full bg-dark-800 overflow-hidden flex items-center justify-center border border-dark-700">
              {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-dark-400" />}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-dark-800 bg-dark-950/50 hidden md:block py-6 pr-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-900/20 text-primary-400 font-medium'
                      : 'text-dark-400 hover:bg-dark-900 hover:text-dark-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-dark-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 z-50 px-4 py-2 flex justify-between overflow-x-auto">
         {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${isActive ? 'text-primary-400' : 'text-dark-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            )
         })}
      </div>
    </div>
  );
}
