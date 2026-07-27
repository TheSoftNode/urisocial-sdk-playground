'use client';

import { useState, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Home,
  FileText,
  Calendar,
  BarChart3,
  Link2,
  Video,
  Palette,
  Newspaper,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Onboarding Flow', href: '/dashboard/onboarding', icon: User },
  { name: 'Brand Profile', href: '/dashboard/brand', icon: Palette },
  { name: 'Content Generator', href: '/dashboard/content', icon: FileText },
  { name: 'Drafts', href: '/dashboard/drafts', icon: FileText },
  { name: 'Blog', href: '/dashboard/blog', icon: Newspaper },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Connections', href: '/dashboard/connections', icon: Link2 },
  { name: 'Video', href: '/dashboard/video', icon: Video },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <Sidebar
            navigation={navigation}
            pathname={pathname}
            user={user}
            logout={logout}
            onClose={() => setSidebarOpen(false)}
            collapsed={false}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300`}>
        <div className="flex flex-col w-full bg-white border-r border-gray-200">
          <Sidebar
            navigation={navigation}
            pathname={pathname}
            user={user}
            logout={logout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="docerityMobileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f93a87" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#docerityMobileGradient)" strokeWidth="5"/>
                <path
                  d="M 30 20 L 30 80 L 58 80 C 73 80 82 71 82 50 C 82 29 73 20 58 20 Z M 38 28 L 58 28 C 68 28 74 34 74 50 C 74 66 68 72 58 72 L 38 72 Z"
                  fill="url(#docerityMobileGradient)"
                />
                <circle cx="60" cy="50" r="6" fill="#22c55e"/>
              </svg>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  navigation,
  pathname,
  user,
  logout,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  navigation: NavItem[];
  pathname: string;
  user: any;
  logout: () => void;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 relative">
        {!collapsed && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="docerityMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f93a87" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  {/* Outer circle border */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="url(#docerityMainGradient)" strokeWidth="5"/>
                  {/* Stylized D letter - larger and bolder */}
                  <path
                    d="M 30 20 L 30 80 L 58 80 C 73 80 82 71 82 50 C 82 29 73 20 58 20 Z M 38 28 L 58 28 C 68 28 74 34 74 50 C 74 66 68 72 58 72 L 38 72 Z"
                    fill="url(#docerityMainGradient)"
                  />
                  {/* Accent dot */}
                  <circle cx="60" cy="50" r="6" fill="#22c55e"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Docerity</h1>
            </div>
            {onClose && (
              <button onClick={onClose} className="absolute right-4 lg:hidden p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            )}
          </>
        )}
        {collapsed && onToggleCollapse && (
          <button onClick={onToggleCollapse} className="p-2 rounded-md hover:bg-gray-100">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="docerityCollapsedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f93a87" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#docerityCollapsedGradient)" strokeWidth="5"/>
                <path
                  d="M 30 20 L 30 80 L 58 80 C 73 80 82 71 82 50 C 82 29 73 20 58 20 Z M 38 28 L 58 28 C 68 28 74 34 74 50 C 74 66 68 72 58 72 L 38 72 Z"
                  fill="url(#docerityCollapsedGradient)"
                />
                <circle cx="60" cy="50" r="6" fill="#22c55e"/>
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: '#f93a87' } : {}}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!collapsed && onToggleCollapse && (
        <div className="px-3 py-2 border-t border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 mr-3" />
            Collapse
          </button>
        </div>
      )}

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-200">
        {!collapsed ? (
          <>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#f93a87' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2 text-gray-700 rounded-md hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
