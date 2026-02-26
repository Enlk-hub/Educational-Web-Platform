import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TestResult } from '../types';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home, ArrowRight, Share2, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

interface ResultsPageProps {
  results: TestResult[];
  onNavigate: (page: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ results, onNavigate }) => {
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxTotalScore = results.reduce((sum, r) => sum + r.maxScore, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const percentage = Math.round((totalScore / 140) * 100);

  const getStatus = (percentage: number) => {
    if (percentage >= 90) return { text: 'КАНДИДАТ В ГРАНТ', level: 'PRO', color: 'text-green-500', bg: 'bg-green-500/10', icon: Trophy, note: 'Твой результат выше 90% студентов!' };
    if (percentage >= 70) return { text: 'ОТЛИЧНЫЙ ТЕМП', level: 'ЛУЧШИЙ', color: 'text-primary', bg: 'bg-primary/10', icon: Sparkles, note: 'Ты на верном пути к своей цели.' };
    return { text: 'ТРЕБУЕТСЯ ПРАКТИКА', level: 'БАЗОВЫЙ', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: TrendingUp, note: 'Просмотри видеоуроки для улучшения результата.' };
  };

  const status = getStatus(percentage);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-[1200px]">

        {/* HERO SECTION - SCORE VISUALIZATION */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-6">
              <FadeIn>
                <Badge variant="outline" className="rounded-full px-4 h-7 uppercase font-black text-[10px] tracking-widest border-primary/20 text-primary bg-primary/5">
                  ТЕСТИРОВАНИЕ ЗАВЕРШЕНО
                </Badge>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                  ТВОЙ <br />
                  <span className="text-primary italic">РЕЗУЛЬТАТ</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-xl italic">
                  {status.note} Продолжай заниматься в том же темпе, и грант будет у тебя в кармане!
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => onNavigate('subjects')} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest italic shadow-xl shadow-primary/20">
                    Пройти еще раз <ArrowRight className="ml-4 w-5 h-5" />
                  </Button>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.4}>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[60px] group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="relative bg-[#0A0A0B] rounded-[4rem] p-12 text-center text-white border border-white/5 no-shadow overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center justify-center mb-6">
                    <div className={`w-20 h-20 rounded-3xl ${status.bg} flex items-center justify-center`}>
                      <status.icon className={`w-10 h-10 ${status.color}`} />
                    </div>
                  </div>
                  <div className="text-8xl font-black tracking-tighter leading-none mb-2">{totalScore}</div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">БАЛЛОВ ИЗ 140</div>
                  <div className={`mt-8 px-4 py-2 rounded-2xl ${status.bg} border border-${status.color.split('-')[1]}-500/20 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.text}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* STATS BENTO GRID */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'ТОЧНОСТЬ', value: `${percentage}%`, icon: Target, color: 'blue' },
              { label: 'ПРАВИЛЬНО', value: `${totalCorrect} / ${totalQuestions}`, icon: CheckCircle, color: 'green' },
              { label: 'ПРЕДМЕТОВ', value: results.length, icon: Sparkles, color: 'purple' },
              { label: 'СТАТУС', value: status.level, icon: Zap, color: 'orange' }
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.5 + (i * 0.1)}>
                <Card className="rounded-[2.5rem] border-none bg-white p-8 no-shadow group hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center transition-transform group-hover:rotate-12`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tighter uppercase italic">{stat.value}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{stat.label}</div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* SUBJECT BREAKDOWN & RECOMMENDATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn delay={0.9}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Успеваемость по предметам</h2>
              </div>
            </FadeIn>
            <div className="space-y-4">
              {results.map((res, i) => {
                const subPercent = Math.round((res.score / res.maxScore) * 100);
                return (
                  <FadeIn key={res.id} delay={1 + (i * 0.1)}>
                    <Card className="rounded-[2.5rem] border-none bg-white p-6 no-shadow flex items-center gap-8 group hover:translate-x-1 transition-transform">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex flex-col items-center justify-center shrink-0 border border-gray-100">
                        <div className="text-lg font-black tracking-tighter leading-none">{subPercent}%</div>
                        <div className="text-[8px] font-black text-muted-foreground">SCORE</div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-black uppercase tracking-tighter italic">{res.subjectName}</div>
                          <div className="text-[10px] font-black text-muted-foreground italic uppercase">{res.score} / {res.maxScore} баллов</div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subPercent}%` }}
                            transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <FadeIn delay={1.2}>
              <Card className="rounded-[3rem] border-none bg-[#0A0A0B] p-10 no-shadow text-white h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10 space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Наши рекомендации</h3>
                  <div className="space-y-6">
                    {[
                      { text: 'Просмотри видеоуроки по темам, где балл ниже 75%', color: 'primary' },
                      { text: 'Пройди тренировочный тест по математике еще раз', color: 'blue' },
                      { text: 'Подпишись на ежедневную рассылку задач в Telegram', color: 'green' }
                    ].map((rec, i) => (
                      <div key={i} className="flex gap-4 items-start group">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                          <div className={`w-1.5 h-1.5 bg-${rec.color === 'primary' ? 'primary' : 'white'} rounded-full animate-pulse`} />
                        </div>
                        <p className="text-sm font-medium text-white/60 italic leading-relaxed group-hover:text-white transition-colors">
                          {rec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => onNavigate('videos')} variant="secondary" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] italic">
                    Смотреть видеоуроки
                  </Button>
                </div>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* DETAILED ANSWERS BREAKDOWN (Visible only right after test) */}
        {results.some(res => res.sessionData && res.answers?.length) && (
          <section className="mt-16">
            <FadeIn delay={1.4}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Разбор вопросов</h2>
              </div>
            </FadeIn>

            <div className="space-y-12">
              {results.filter(res => res.sessionData && res.answers?.length).map((res, i) => (
                <div key={res.id} className="space-y-6">
                  <FadeIn delay={1.5 + (i * 0.1)}>
                    <h3 className="text-lg font-black uppercase tracking-widest italic text-muted-foreground border-b border-gray-100 pb-2 mb-6">
                      {res.subjectName}
                    </h3>
                  </FadeIn>
                  <div className="grid gap-4">
                    {res.sessionData!.questions.map((question, qIdx) => {
                      const answerData = res.answers?.find(a => a.questionId === question.id);
                      if (!answerData) return null;

                      return (
                        <FadeIn key={question.id} delay={1.6 + (qIdx * 0.05)}>
                          <Card className={`rounded-[2rem] border-2 p-6 md:p-8 no-shadow transition-colors ${answerData.isCorrect ? 'border-green-500/20 bg-green-50/30' : 'border-red-500/20 bg-red-50/30'}`}>
                            <div className="mb-6 flex items-start gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${answerData.isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                                {answerData.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter italic leading-snug">
                                  {question.question}
                                </h4>
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              {question.options.map((opt, optIdx) => {
                                const isUserChoice = answerData.selectedOptionId === opt.id;
                                const isCorrectOpt = answerData.correctOptionId === opt.id;

                                let optClass = 'border-gray-100 bg-white text-muted-foreground opacity-60';
                                if (isCorrectOpt) {
                                  optClass = 'border-green-500 bg-green-50 text-green-700 shadow-md transform scale-[1.02] z-10';
                                } else if (isUserChoice && !isCorrectOpt) {
                                  optClass = 'border-red-500 bg-red-50 text-red-700 shadow-md';
                                }

                                const letter = String.fromCharCode(65 + optIdx);
                                return (
                                  <div key={opt.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${optClass}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isCorrectOpt ? 'bg-green-500 text-white' : isUserChoice ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                      {letter}
                                    </div>
                                    <span className="font-bold tracking-tight text-sm md:text-base leading-tight">
                                      {opt.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        </FadeIn>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
