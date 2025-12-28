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
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-semibold">ENTBridge</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={currentPage === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            >
              Главная
            </button>
            {user && (
              <>
                <button
                  onClick={() => onNavigate('subjects')}
                  className={currentPage === 'subjects' || currentPage === 'test' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                >
                  Тесты
                </button>
                <button
                  onClick={() => onNavigate('videos')}
                  className={currentPage === 'videos' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                >
                  Видеоуроки
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className={currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                >
                  Профиль
                </button>
                {user.isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={currentPage === 'admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                  >
                    Админ
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => onNavigate('about')}
              className={currentPage === 'about' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            >
              О платформе
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
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
