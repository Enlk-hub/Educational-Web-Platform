import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BookOpen, Target, Video, Trophy, Clock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6">Подготовка к ЕНТ с ENTBridge</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Комплексная платформа для эффективной подготовки к Единому Национальному Тестированию.
                Проверенные материалы, практические тесты и видеоуроки от лучших преподавателей.
              </p>
              <div className="flex gap-4">
                {user ? (
                  <Button
                    size="lg"
                    onClick={() => onNavigate('subjects')}
                  >
                    Начать тестирование
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => onNavigate('login')}
                    >
                      Начать подготовку
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => onNavigate('about')}
                    >
                      Узнать больше
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1727790632675-204d26c2326c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MTM3ODUzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Students studying"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Почему выбирают ENTBridge?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Наша платформа предоставляет все необходимое для успешной сдачи ЕНТ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mb-2">Все предметы ЕНТ</h3>
              <p className="text-muted-foreground">
                Полный набор материалов по всем обязательным и профильным предметам
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-2">Практические тесты</h3>
              <p className="text-muted-foreground">
                Тысячи вопросов в формате ЕНТ с подробными объяснениями
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mb-2">Видеоуроки</h3>
              <p className="text-muted-foreground">
                Видеоматериалы от опытных преподавателей для лучшего понимания
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="mb-2">Отслеживание прогресса</h3>
              <p className="text-muted-foreground">
                Следите за своими успехами и выявляйте слабые места
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="mb-2">Таймер экзамена</h3>
              <p className="text-muted-foreground">
                Тренируйтесь в условиях, максимально приближенных к реальным
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="mb-2">Поддержка преподавателей</h3>
              <p className="text-muted-foreground">
                Получайте обратную связь и помощь от квалифицированных педагогов
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">5,000+</div>
              <p>Вопросов в базе</p>
            </div>
            <div>
              <div className="text-4xl mb-2">10+</div>
              <p>Предметов</p>
            </div>
            <div>
              <div className="text-4xl mb-2">1,200+</div>
              <p>Студентов</p>
            </div>
            <div>
              <div className="text-4xl mb-2">92%</div>
              <p>Успешных поступлений</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 container mx-auto px-4 text-center">
          <h2 className="mb-4">Готовы начать подготовку?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Зарегистрируйтесь сейчас и получите доступ ко всем материалам для подготовки к ЕНТ
          </p>
          <Button
            size="lg"
            onClick={() => onNavigate('login')}
          >
            Зарегистрироваться бесплатно
          </Button>
        </section>
      )}
    </div>
  );
};
