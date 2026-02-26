import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Mail, Phone, MapPin, Target, Users, Award, BookOpen, Star, Zap, ShieldCheck, Heart, Sparkles, Globe, GraduationCap, History, Milestone, Rocket } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

const FadeInWhenVisible: React.FC<{ children: React.ReactNode; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'; scale?: number; className?: string }> = ({ children, delay = 0, direction = 'up', scale = 1, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

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
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FBFBFD] selection:bg-primary/20 overflow-x-hidden pt-20">
      {/* DIFFERENT HERO: Centered Typography & Impact */}
      <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <FadeInWhenVisible delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground text-white text-[10px] font-black tracking-[0.25em] uppercase no-shadow">
                <History className="w-3.5 h-3.5" />
                Наша ДНК
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <h1 className="text-7xl md:text-[10rem] font-black tracking-[ -0.05em] leading-[0.8] text-foreground uppercase">
                БОЛЬШЕ ЧЕМ <br />
                <span className="text-gradient">ПЛАТФОРМА</span>
              </h1>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <p className="text-2xl text-muted-foreground/80 leading-relaxed font-medium max-w-2xl mx-auto">
                Мы создаем будущее, где успех на ЕНТ зависит от твоих стараний, а не от удачи или связей.
                Интеллектуальная среда для тех, кто метит в лучшие ВУЗы.
              </p>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* NEW SECTION: BENTO GRID VALUES (Differentiates from Home's 2-col) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[650px]">
            {/* Large Card: Масштабная Цель */}
            <FadeInWhenVisible direction="right" className="md:col-span-2 h-full">
              <div className="group relative bg-[#0A0A0B] rounded-[3.5rem] p-12 lg:p-16 overflow-hidden h-full flex flex-col justify-end no-shadow border border-white/5 hover:border-primary/20 transition-all duration-700">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200" className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-1000" alt="Vision" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent" />
                </div>

                <div className="absolute top-12 left-12 z-10 flex items-center gap-4">
                  <div className="w-20 h-20 bg-purple-500/20 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center text-purple-400 rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500">
                    <Rocket className="w-10 h-10" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
                    Target 2026
                  </div>
                </div>

                <div className="relative z-10 space-y-6">
                  <h3 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                    МАСШТАБНАЯ <br />
                    <span className="text-purple-400 italic">ЦЕЛЬ</span>
                  </h3>
                  <p className="text-white/50 text-xl font-medium leading-relaxed max-w-lg">
                    К 2026 году обучить 50,000+ студентов и стать стандартом подготовки к госэкзаменам в Казахстане и СНГ.
                  </p>
                  <div className="flex gap-12 pt-4">
                    <div>
                      <div className="text-3xl font-black text-white">50K+</div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Студентов</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white">100%</div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Покрытие тем</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Small Cards Column */}
            <div className="grid gap-6 h-full">
              {/* Quality Block */}
              <FadeInWhenVisible direction="left" delay={0.2}>
                <div className="bg-gray-50 rounded-[3rem] p-10 h-full flex flex-col justify-between no-shadow relative overflow-hidden group border border-gray-100 hover:border-primary/20 transition-colors duration-500">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full" />
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-100 no-shadow">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-3xl font-black uppercase tracking-tighter leading-none text-foreground">
                      КАЧЕСТВО <br /> <span className="text-primary">№1</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium leading-normal">
                      Весь контент проходит 3 этапа верификации опытными методистами.
                    </p>
                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest border-t border-gray-100 pt-4">
                      100% Актуальность
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>

              {/* Technology Block */}
              <FadeInWhenVisible direction="left" delay={0.4}>
                <div className="bg-primary rounded-[3rem] p-10 h-full flex flex-col justify-between no-shadow group border border-primary/20 relative overflow-hidden">
                  {/* Abstract Grid background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Live System</span>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="text-3xl font-black uppercase tracking-tighter leading-none text-white whitespace-pre-line">
                      ТЕХНОЛОГИИ {'\n'} 24/7
                    </div>
                    <p className="text-white/60 text-sm font-medium leading-normal">
                      Персональные алгоритмы подбора заданий на базе машинного обучения.
                    </p>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest border-t border-white/10 pt-4">
                      Умные алгоритмы
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Horizontal "Our Path" (Timeline) */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-4">
              <div className="text-primary font-black tracking-widest uppercase text-sm">Хронология</div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">ПУТЬ ОТ <br /> ИДЕИ К ЛИДЕРУ</h2>
            </div>
            <p className="text-white/40 text-lg font-medium max-w-sm mb-2">За каждым баллом стоит история сотен часов работы команды методистов и разработчиков.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-[20%] left-0 w-full h-[1px] bg-white/5 hidden md:block" />

            {[
              { year: '2019', title: 'Основание', desc: 'Первая группа из 10 человек в Астане. Проходной балл 115+ у всех.' },
              { year: '2021', title: 'Диджитализация', desc: 'Запуск первой версии онлайн-платформы с ИИ-подбором тем.' },
              { year: '2024', title: 'Масштаб', desc: 'Партнерства с крупнейшими школами и выход на 15,000+ заданий.' }
            ].map((step, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.2} direction="up">
                <div className="space-y-8 relative">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl no-shadow relative z-10">
                    {step.year}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black uppercase tracking-tight">{step.title}</h4>
                    <p className="text-white/50 text-sm font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* MINIMAL PHILOSOPHY (Manifesto Style) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeInWhenVisible scale={0.98}>
            <div className="text-center space-y-16">
              <div className="w-16 h-1 bg-primary mx-auto" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[1.1] italic">
                "МЫ ВЕРИМ, ЧТО ОБРАЗОВАНИЕ — ЭТО ПРАВО, <br />
                <span className="text-primary italic">А НЕ ПРИВИЛЕГИЯ.</span> МЫ ЗДЕСЬ, ЧТОБЫ УРАВНЯТЬ ШАНСЫ ПОЛУЧЕНИЯ ГРАНТА ДЛЯ КАЖДОГО."
              </h2>
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black uppercase tracking-tight">Шаяхмет Енлик | Даниярова Меруерт</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Основатели ENTBridge</div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* CONTACTS - Different color layout (Deep Blue) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeInWhenVisible>
            <div className="bg-[#0A0A0B] rounded-[4rem] p-12 lg:p-24 text-white relative overflow-hidden no-shadow border border-white/5">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full" />

              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                      НАШИ <br /> <span className="text-primary">СВЯЗИ</span>
                    </h2>
                    <p className="text-white/50 text-xl font-medium max-w-xs">Центральный офис в Астане. Всегда на связи.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">ПОЧТА</div>
                      <a href="mailto:info@entbridge.kz" className="text-xl font-black hover:text-primary transition-colors block">info@entbridge.kz</a>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">ТЕЛЕФОН</div>
                      <a href="tel:+77779844335" className="text-xl font-black hover:text-primary transition-colors block">+ 7 777 984 43 35</a>
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">ЛОКАЦИЯ</div>
                      <div className="text-xl font-black uppercase tracking-tight">офис на Улы дала 45/1</div>
                    </div>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border-2 border-white/5 no-shadow grayscale hover:grayscale-0 transition-all duration-700">
                    <img
                      src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200"
                      className="w-full h-full object-cover"
                      alt="Front desk"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white no-shadow">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">ENTBridge</span>
          </div>
          <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">TikTok</a>
            <a href="#" className="hover:text-primary transition-colors">YouTube</a>
          </div>
          <p className="text-muted-foreground/40 text-xs font-medium uppercase tracking-widest">© 2024 ENTBridge Education. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
