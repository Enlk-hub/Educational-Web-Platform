import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Question, Subject, TestResult } from '../types';
import { Clock, ChevronLeft, ChevronRight, Zap, CheckCircle, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

interface TestPageProps {
  subjects: Subject[];
  onComplete: (results: TestResult[]) => void;
}

export const TestPage: React.FC<TestPageProps> = ({ subjects, onComplete }) => {
  const { user } = useAuth();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, Question[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const currentSubject = subjects[currentSubjectIndex];
  const subjectQuestions = currentSubject ? questionsBySubject[currentSubject.id] || [] : [];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  useEffect(() => {
    let isActive = true;
    const loadQuestions = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const entries = await Promise.all(
          subjects.map(async (subject) => ({
            subjectId: subject.id,
            questions: await api.getQuestions(subject.id),
          }))
        );
        if (!isActive) return;
        const mapped: Record<string, Question[]> = {};
        entries.forEach(({ subjectId, questions }) => {
          mapped[subjectId] = questions;
        });
        setQuestionsBySubject(mapped);
      } catch (err) {
        if (!isActive) return;
        setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки вопросов');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    if (subjects.length > 0) loadQuestions();
    else setIsLoading(false);
    return () => { isActive = false; };
  }, [subjects]);

  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSubjectIndex < subjects.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      handleFinishTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSubjectIndex > 0) {
      const prevSubject = subjects[currentSubjectIndex - 1];
      const prevSubjectQuestions = questionsBySubject[prevSubject.id] || [];
      setCurrentSubjectIndex(currentSubjectIndex - 1);
      setCurrentQuestionIndex(Math.max(prevSubjectQuestions.length - 1, 0));
    }
  };

  const handleFinishTest = async () => {
    if (isCompleted) return;
    setSubmitError('');
    setIsCompleted(true);
    try {
      const results = await Promise.all(
        subjects.map(async (subject) => {
          const subjectQs = questionsBySubject[subject.id] || [];
          if (subjectQs.length === 0) throw new Error('Вопросы для выбранного предмета не найдены');
          const payloadAnswers = subjectQs.map((question) => ({
            questionId: question.id,
            selectedOptionId: answers[question.id],
          }));
          const result = await api.submitTest(subject.id, payloadAnswers);
          return {
            ...result,
            userId: result.userId || user?.id || '1',
            sessionData: {
              questions: subjectQs,
              userAnswers: answers
            }
          } as TestResult;
        })
      );
      onComplete(results);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки теста');
      setIsCompleted(false);
    }
  };

  const totalQuestions = subjects.reduce((sum, s) => sum + (questionsBySubject[s.id]?.length || 0), 0);
  const answeredQuestions = Object.keys(answers).length;
  const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (isLoading) return <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center font-black uppercase tracking-widest text-muted-foreground opacity-50 italic">Подготовка теста...</div>;
  if (loadError || !currentQuestion) return <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center font-black uppercase tracking-widest text-red-500 opacity-50 italic">{loadError || 'Вопросы не найдены'}</div>;

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-400/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation / Progress */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center w-full md:w-auto justify-between md:justify-start gap-8">
            <div className="flex items-center gap-3 bg-white/80 p-2 pr-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tabular-nums tracking-tighter italic text-[#0A0A0B]">{formatTime(timeLeft)}</span>
            </div>
            <div className="hidden lg:flex gap-2 bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
              {subjects.map((sub, i) => (
                <button
                  key={sub.id}
                  onClick={() => { setCurrentSubjectIndex(i); setCurrentQuestionIndex(0); }}
                  className={`h-10 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${i === currentSubjectIndex
                    ? 'bg-[#0A0A0B] text-white shadow-xl shadow-black/10 scale-105'
                    : 'text-muted-foreground hover:bg-white hover:text-[#0A0A0B] hover:shadow-sm'
                    }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-[250px] bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-widest text-[#0A0A0B]">
              <span>Ваш прогресс</span>
              <span className="text-primary">{answeredQuestions} / {totalQuestions}</span>
            </div>
            <Progress value={overallProgress} className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${overallProgress}%` }} />
            </Progress>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 md:px-6 relative z-10 w-full">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSubject.id}-${currentQuestion.id}`}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {/* Question Card */}
              <div className="p-8 md:p-14 bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-black/5 border border-white relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-xl">
                      {currentSubject.name}
                    </Badge>
                    <Badge variant="outline" className="border-gray-200 text-muted-foreground font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-xl">
                      ВОПРОС {currentQuestionIndex + 1} ИЗ {subjectQuestions.length}
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] italic text-[#0A0A0B]">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={`group flex items-center gap-5 p-6 lg:p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden ${isSelected
                        ? 'border-primary bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]'
                        : 'border-white bg-white/80 backdrop-blur-md hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-black/5'
                        }`}
                    >
                      {/* Hover effect background */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}

                      <div className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${isSelected
                        ? 'bg-white text-primary shadow-lg'
                        : 'bg-gray-100 text-[#0A0A0B] group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                        {letter}
                      </div>

                      <span className="flex-1 font-black uppercase tracking-tighter italic text-lg md:text-xl relative z-10 leading-tight">
                        {option.text}
                      </span>

                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                        <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] px-6 py-6 sticky bottom-0 z-40 relative">
        <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentSubjectIndex === 0 && currentQuestionIndex === 0}
            className="rounded-2xl h-14 px-6 md:px-8 font-black uppercase tracking-widest italic text-sm md:text-base hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 mr-3" /> <span className="hidden md:inline">Предыдущий</span>
          </Button>

          {/* Question Navigator (Dots/Numbers) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-[500px] no-scrollbar px-6 py-2 bg-gray-50/50 rounded-2xl border border-gray-100">
            {subjectQuestions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 ${isCurrent
                    ? 'bg-[#0A0A0B] text-white scale-110 shadow-xl shadow-black/20'
                    : isAnswered
                      ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                      : 'bg-white text-muted-foreground border border-gray-200 hover:border-primary/40 hover:text-[#0A0A0B]'
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 font-black border-2 border-gray-200 text-muted-foreground hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50/50 hover:shadow-lg transition-all">
              <Flag className="w-5 h-5" />
            </Button>
            {currentSubjectIndex === subjects.length - 1 && currentQuestionIndex === subjectQuestions.length - 1 ? (
              <Button
                onClick={handleFinishTest}
                className="rounded-2xl h-14 px-8 md:px-10 font-black uppercase tracking-widest text-sm md:text-lg shadow-xl shadow-primary/30 bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] transition-all"
              >
                ЗАВЕРШИТЬ <Zap className="w-5 h-5 ml-4 text-white" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="rounded-2xl h-14 px-8 md:px-10 font-black uppercase tracking-widest text-sm md:text-lg shadow-xl shadow-black/10 bg-[#0A0A0B] text-white hover:bg-black hover:scale-[1.02] transition-all"
              >
                ДАЛЕЕ <ChevronRight className="w-5 h-5 ml-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
