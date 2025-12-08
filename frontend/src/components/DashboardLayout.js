import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  LayoutDashboard,
  Users,
  Car,
  Bell,
  LogOut,
  Search,
  Menu,
  X,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Reminders', href: '/reminders', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await api.get(`/search/${searchQuery}`);
      const { customers, vehicles } = response.data;

      if (vehicles.length > 0) {
        navigate(`/vehicles/${vehicles[0].id}`);
      } else if (customers.length > 0) {
        navigate(`/customers/${customers[0].id}`);
      } else {
        toast.info('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:translate-x-0 lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900/50 border-r border-zinc-800 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center">
                <Wrench className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold text-white tracking-tight">
                  IgnitionLab
                </h1>
                <p className="text-xs text-zinc-400">Dynamics</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-zinc-500 uppercase">{user?.role}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              data-testid="logout-button"
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-zinc-900/30 border-b border-zinc-800 sticky top-0 z-30 backdrop-blur-sm">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-zinc-400 hover:text-white"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    type="text"
                    data-testid="global-search-input"
                    placeholder="Search by customer, phone, VIN, or registration..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 text-white placeholder:text-zinc-500"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate('/jobs/create')}
                  data-testid="create-job-button"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow text-xs md:text-sm"
                >
                  + New Job
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}