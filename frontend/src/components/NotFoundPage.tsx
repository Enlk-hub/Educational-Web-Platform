import React from 'react';
import { Button } from './ui/button';

type NotFoundPageProps = {
  onNavigate: (page: string) => void;
};

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fde68a_0%,_transparent_50%),radial-gradient(circle_at_bottom,_#fda4af_0%,_transparent_55%)] opacity-70" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
      <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ошибка</div>
        <h1 className="mt-4 text-6xl font-semibold tracking-tight sm:text-7xl">404</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Такой страницы нет, но у нас есть много полезного контента. Вернемся к главному экрану?
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => onNavigate('home')}>На главную</Button>
          <Button variant="outline" onClick={() => onNavigate('about')}>
            О платформе
          </Button>
        </div>
        <div className="mt-10 grid gap-4 text-left text-sm text-muted-foreground sm:grid-cols-3">
          <div className="rounded-xl border bg-background/70 p-4 backdrop-blur">
            <div className="text-base font-medium text-foreground">Предметы</div>
            <div className="mt-1">Выберите предмет и начните тренировку.</div>
          </div>
          <div className="rounded-xl border bg-background/70 p-4 backdrop-blur">
            <div className="text-base font-medium text-foreground">Видео</div>
            <div className="mt-1">Смотрите уроки и конспекты.</div>
          </div>
          <div className="rounded-xl border bg-background/70 p-4 backdrop-blur">
            <div className="text-base font-medium text-foreground">Профиль</div>
            <div className="mt-1">Отслеживайте прогресс и результаты.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
