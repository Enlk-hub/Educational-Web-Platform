import React, { useEffect } from 'react';
import { Button } from './ui/button';
import {
  BookOpen, Target, Video, Trophy, Clock, Users, ArrowRight,
  GraduationCap, CheckCircle2, Star, Zap, ShieldCheck,
  BarChart3, Layout, MousePointer2, Smartphone, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const FadeInWhenVisible: React.FC<{ children: React.ReactNode; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'; scale?: number }> = ({ children, delay = 0, direction = 'up', scale = 1 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.01 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    hidden: {
      opacity: 0,
      scale: scale,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full"
          />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black tracking-[0.2em] uppercase no-shadow mb-6">
                  <Sparkles className="w-3.5 h-3.5 fill-primary" />
                  Платформа №1 в Казахстане
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] text-foreground mb-8"
              >
                БУДУЩЕЕ <br />
                <span className="text-gradient">ЗА ГРАНТОМ</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0 mb-10"
              >
                Интеллектуальная система подготовки к ЕНТ. Мы знаем все секреты экзамена и поможем тебе поступить в лучший ВУЗ.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  className="h-16 px-12 text-xl transition-all font-black rounded-2xl no-shadow bg-foreground hover:bg-black text-white hover:scale-105"
                  onClick={() => onNavigate(user ? 'subjects' : 'login')}
                >
                  {user ? 'ПРОДОЛЖИТЬ' : 'ПОЛУЧИТЬ ДОСТУП'}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 text-xl bg-transparent transition-all font-black rounded-2xl border-gray-200 no-shadow hover:bg-gray-50 flex items-center justify-center text-foreground"
                  onClick={() => onNavigate('about')}
                >
                  О ПЛАТФОРМЕ
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-[3rem] border-[12px] border-gray-50/50 overflow-hidden no-shadow group aspect-square bg-gray-100 shadow-2xl">
                <img
                  src="/hero.png"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt="High Tech Classroom"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Interactive Floating Stats */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-6 lg:-right-12 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Результат</div>
                  <div className="text-xl font-black text-foreground">140 баллов</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-6 lg:-left-12 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex items-center gap-4 z-20"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-sm font-black tracking-tight">+12,400 студентов уже с нами</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Quick Strip */}
      <section className="py-12 bg-foreground text-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Успешных грантов', value: '4,500+' },
              { label: 'Средний балл', value: '118' },
              { label: 'Видеоуроков', value: '1,200+' },
              { label: 'Тестовых вопросов', value: '50к+' }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="text-3xl md:text-4xl font-black tracking-tighter text-white">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <FadeInWhenVisible>
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                Всё для новой <br /> <span className="text-gradient">ОРБИТЫ</span>
              </h2>
              <p className="text-muted-foreground font-medium text-xl leading-relaxed">Понятные инструменты, созданные специально для подготовки к ЕНТ.</p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: 'Дружелюбный интерфейс',
                desc: 'Никаких скучных таблиц. Только современный дизайн, интуитивная навигация и темная тема.',
                color: 'bg-indigo-50 text-indigo-600',
                delay: 0.1
              },
              {
                icon: MousePointer2,
                title: 'Интерактивные тесты',
                desc: 'Решай задания онлайн и получай мгновенный видео-разбор каждой ошибки от лучших преподавателей.',
                color: 'bg-purple-50 text-purple-600',
                delay: 0.2
              },
              {
                icon: Smartphone,
                title: 'Учись в кармане',
                desc: 'Полноценная мобильная версия. Теперь подготовка доступна везде: в автобусе, в парке или дома.',
                color: 'bg-emerald-50 text-emerald-600',
                delay: 0.3
              }
            ].map((feature, i) => (
              <FadeInWhenVisible key={i} delay={feature.delay} direction="up">
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col gap-8 group hover:border-primary/20">
                  <div className={`w-16 h-16 ${feature.color} rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black tracking-tight uppercase leading-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium text-lg">{feature.desc}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Path to Success Step-by-Step */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <FadeInWhenVisible direction="right">
              <div className="space-y-12">
                <div className="space-y-6">
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                    ТВОЙ ПУТЬ <br /> К <span className="text-gradient">ГРАНТУ</span>
                  </h2>
                  <p className="text-xl text-muted-foreground font-medium">Мы разработали пошаговую систему, которая гарантирует рост результата.</p>
                </div>

                <div className="space-y-8">
                  {[
                    { step: '01', title: 'Входное тестирование', desc: 'Проверь свой уровень и узнай слабые темы за 20 минут.' },
                    { step: '02', title: 'Персональный план', desc: 'Система сама составит график обучения на основе твоих целей.' },
                    { step: '03', title: 'Контроль прогресса', desc: 'Еженедельные пробники показывают динамику твоего роста.' }
                  ].map((p, i) => (
                    <div key={i} className="flex gap-8 group">
                      <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">{p.step}</div>
                      <div className="space-y-2">
                        <div className="text-2xl font-black tracking-tight uppercase">{p.title}</div>
                        <p className="text-muted-foreground font-medium leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="h-16 px-12 text-xl font-black rounded-2xl bg-foreground text-white no-shadow w-full sm:w-auto hover:bg-black transition-all"
                  onClick={() => onNavigate('login')}
                >
                  НАЧАТЬ ПУТЕШЕСТВИЕ
                </Button>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible direction="left">
              <div className="relative">
                <div className="relative rounded-[4rem] overflow-hidden border-[12px] border-gray-50 no-shadow aspect-[4/5] shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200"
                    className="w-full h-full object-cover"
                    alt="Success Path"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-10 pt-24 bg-gradient-to-t from-black via-black/40 to-transparent text-white">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-widest opacity-60">Старт группы</div>
                          <div className="text-xl font-black">25 ФЕВРАЛЯ</div>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '85%' }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Мест осталось: 12 из 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 text-center">
          <FadeInWhenVisible scale={0.95}>
            <div className="bg-foreground rounded-[4rem] px-8 py-24 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-12">
                <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                  ТВОЙ ГРАНТ <br /> ЖДЕТ <span className="text-primary">ТЕБЯ</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Button
                    size="lg"
                    className="h-20 px-16 text-2xl font-black rounded-2xl w-full sm:w-auto bg-white text-black hover:bg-gray-100 no-shadow hover:scale-105 transition-all"
                    onClick={() => onNavigate('login')}
                  >
                    ЗАРЕГИСТРИРОВАТЬСЯ
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 px-16 text-2xl font-black rounded-2xl w-full sm:w-auto border-2 border-white/40 bg-transparent text-white hover:bg-white/10 no-shadow hover:text-white flex items-center justify-center transition-all"
                    onClick={() => onNavigate('about')}
                  >
                    О ПЛАТФОРМЕ
                  </Button>
                </div>
                <div className="pt-6">
                  <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">Присоединяйся к 50,000+ абитуриентов</p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-1 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">ENTBridge</span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">Инновационная образовательная платформа для подготовки к ЕНТ. Только актуальные тесты и лучшие педагоги Казахстана.</p>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Навигация</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Главная</button></li>
                <li><button onClick={() => onNavigate(user ? 'subjects' : 'login')} className="hover:text-primary transition-colors">Тесты</button></li>
                <li><button onClick={() => onNavigate(user ? 'videos' : 'login')} className="hover:text-primary transition-colors">Видеоуроки</button></li>
                <li><button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors">О платформе</button></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Соцсети</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Контакты</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li>support@entbridge.kz</li>
                <li>+ 7 777 984 43 35</li>
                <li>офис на Улы дала 45/1</li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">© 2024 ENTBRIDGE. Все права защищены.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-primary transition-colors">Оферта</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
