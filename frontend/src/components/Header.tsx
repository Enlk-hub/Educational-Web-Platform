import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <div className="container mx-auto max-w-7xl">
        <div className="glass bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 px-6 py-3 flex items-center justify-between pointer-events-auto no-shadow">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">ENTBridge</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: 'home', label: 'Главная' },
              { id: 'subjects', label: 'Тесты', auth: true },
              { id: 'videos', label: 'Видеоуроки', auth: true },
              { id: 'profile', label: 'Профиль', auth: true },
              { id: 'about', label: 'О платформе' },
              { id: 'admin', label: 'Админ Панель', adminOnly: true },
            ].map((link) => {
              if (link.auth && !user) return null;
              if (link.adminOnly && !user?.isAdmin) return null;

              const isActive = currentPage === link.id || (link.id === 'subjects' && currentPage === 'test');
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-xs font-black uppercase tracking-[0.1em] transition-colors relative py-1 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 no-shadow">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-black tracking-tight">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-black text-[10px] uppercase tracking-widest no-shadow"
                  onClick={() => {
                    logout();
                    onNavigate('home');
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Button
                className="rounded-xl px-6 font-black text-xs uppercase tracking-widest no-shadow"
                onClick={() => onNavigate('login')}
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
