import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginForm.username || !loginForm.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const success = await login(loginForm.username, loginForm.password);
    if (success) {
      onNavigate('subjects');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerForm.name || !registerForm.email || !registerForm.username || !registerForm.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const success = await register(
      registerForm.name,
      registerForm.email,
      registerForm.username,
      registerForm.password
    );

    if (success) {
      onNavigate('subjects');
    } else {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Добро пожаловать в ENTBridge</CardTitle>
          <CardDescription>
            Войдите или создайте новый аккаунт для начала подготовки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-username">Имя пользователя</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="aigul_student"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Войти
                </Button>

                <div className="text-sm text-muted-foreground text-center mt-4">
                  Для тестирования используйте:<br />
                  <code className="bg-muted px-2 py-1 rounded">aigul_student</code> (студент) или{' '}
                  <code className="bg-muted px-2 py-1 rounded">admin</code> (администратор)
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-name">Полное имя</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Иванов Иван"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ivan@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Имя пользователя</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="ivan_student"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
