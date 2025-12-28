import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mail, Phone, MapPin, Target, Users, Award, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6">О платформе ENTBridge</h1>
              <p className="text-lg text-muted-foreground mb-6">
                ENTBridge — это современная образовательная платформа для подготовки к Единому 
                Национальному Тестированию (ЕНТ) в Казахстане. Мы помогаем тысячам студентов 
                успешно сдать экзамены и поступить в ведущие вузы страны.
              </p>
              <Button size="lg" onClick={() => onNavigate('login')}>
                Начать обучение
              </Button>
            </div>
            <div className="hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1588912914074-b93851ff14b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjEzNjY4NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Online learning"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4">Наша миссия и ценности</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы создаем инновационные решения для качественного образования
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Наша миссия</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Обеспечить доступное и качественное образование для всех студентов Казахстана, 
                помогая им достичь своих академических целей и успешно поступить в университеты.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Наши ценности</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Качество образовательных материалов</li>
                <li>• Доступность для всех студентов</li>
                <li>• Инновационный подход к обучению</li>
                <li>• Поддержка и мотивация учащихся</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="mb-12 text-center">Что мы предлагаем</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="mb-2">Комплексная подготовка</h3>
                <p className="text-muted-foreground">
                  Полный курс по всем предметам ЕНТ с теоретическими материалами и практическими заданиями
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="mb-2">Опытные преподаватели</h3>
                <p className="text-muted-foreground">
                  Материалы разработаны квалифицированными педагогами с многолетним опытом подготовки к ЕНТ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="mb-2">Проверенные результаты</h3>
                <p className="text-muted-foreground">
                  92% наших студентов успешно поступают в вузы, набирая высокие баллы на ЕНТ
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4">Свяжитесь с нами</h2>
          <p className="text-muted-foreground">
            Мы всегда рады ответить на ваши вопросы
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mb-2">Email</h3>
              <p className="text-muted-foreground">info@entbridge.kz</p>
              <p className="text-muted-foreground">support@entbridge.kz</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-2">Телефон</h3>
              <p className="text-muted-foreground">+7 (727) 123-45-67</p>
              <p className="text-muted-foreground">+7 (708) 987-65-43</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mb-2">Адрес</h3>
              <p className="text-muted-foreground">г. Алматы</p>
              <p className="text-muted-foreground">ул. Абая, 143</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="mb-12 text-center">О нас в цифрах</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-2">5+</div>
              <p className="text-muted-foreground">Лет опыта</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">1,200+</div>
              <p className="text-muted-foreground">Студентов</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">50+</div>
              <p className="text-muted-foreground">Преподавателей</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">92%</div>
              <p className="text-muted-foreground">Поступление</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
