import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../api/client';
import { Subject } from '../types';
import { CheckCircle2, Circle, Beaker, Globe, Palette, GraduationCap, ArrowRight, Zap, Target } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

interface SubjectSelectionPageProps {
  onStartTest: (selectedSubjects: Subject[]) => void;
}

export const SubjectSelectionPage: React.FC<SubjectSelectionPageProps> = ({ onStartTest }) => {
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false));
  }, []);

  const mandatorySubjects = subjects.filter(s => s.isMandatory);
  const electiveSubjects = subjects.filter(s => !s.isMandatory);

  const naturalSciences = electiveSubjects.filter(s => s.category === 'natural-sciences');
  const socialSciences = electiveSubjects.filter(s => s.category === 'social-sciences');
  const creative = electiveSubjects.filter(s => s.category === 'creative');

  const toggleElective = (subjectId: string) => {
    if (selectedElectives.includes(subjectId)) {
      setSelectedElectives(selectedElectives.filter(id => id !== subjectId));
    } else if (selectedElectives.length < 2) {
      setSelectedElectives([...selectedElectives, subjectId]);
    }
    setError('');
  };

  const handleStartTest = () => {
    if (selectedElectives.length !== 2) {
      setError('Пожалуйста, выберите ровно 2 профильных предмета');
      return;
    }

    const selectedSubjectsList = [
      ...mandatorySubjects,
      ...subjects.filter(s => selectedElectives.includes(s.id)),
    ];

    onStartTest(selectedSubjectsList);
  };

  const totalScore = mandatorySubjects.reduce((sum, s) => sum + s.maxScore, 0) +
    subjects.filter(s => selectedElectives.includes(s.id)).reduce((sum, s) => sum + s.maxScore, 0);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pt-32 pb-24 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">

        {/* HERO SECTION */}
        <section className="mb-16">
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
              <div className="space-y-6">
                <Badge variant="outline" className="rounded-full px-5 py-1.5 uppercase font-black text-[11px] tracking-widest border-primary/30 text-primary bg-primary/10 backdrop-blur-md">
                  Подготовка к ЕНТ 2024
                </Badge>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-[#0A0A0B]">
                  ВЫБОР <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">ПРЕДМЕТОВ</span>
                </h1>
                <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-xl italic">
                  Выберите 2 профильных предмета в дополнение к обязательным для формирования персонального тестирования.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl shadow-black/5 border-2 border-white min-w-[200px] flex flex-col justify-center transition-transform hover:scale-105">
                  <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">Выбрано предметов</div>
                  <div className="text-4xl font-black tracking-tighter text-[#0A0A0B]">{mandatorySubjects.length + selectedElectives.length} <span className="text-lg text-muted-foreground/50">/ 5</span></div>
                </div>
                <div className="bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] p-6 rounded-[2.5rem] shadow-2xl shadow-black/20 min-w-[200px] text-white flex flex-col justify-center transition-transform hover:scale-105 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-colors" />
                  <div className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1 relative z-10">Максимальный балл</div>
                  <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 relative z-10">{totalScore} <span className="text-lg text-white/30">/ 140</span></div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {loadError && (
          <FadeIn>
            <Alert variant="destructive" className="mb-10 rounded-3xl border border-red-100 bg-red-50/80 backdrop-blur-md text-red-600 shadow-xl shadow-red-500/10 p-6">
              <AlertDescription className="font-black uppercase tracking-widest text-xs italic">{loadError}</AlertDescription>
            </Alert>
          </FadeIn>
        )}

        {error && (
          <FadeIn>
            <Alert variant="destructive" className="mb-10 rounded-3xl border border-red-100 bg-red-50/80 backdrop-blur-md text-red-600 shadow-xl shadow-red-500/10 p-6">
              <AlertDescription className="font-black uppercase tracking-widest text-xs italic">{error}</AlertDescription>
            </Alert>
          </FadeIn>
        )}

        {isLoading ? (
          <div className="py-24 text-center font-black uppercase tracking-widest text-muted-foreground text-xl italic opacity-50 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            Загрузка предметов...
          </div>
        ) : (
          <div className="space-y-20">

            {/* MANDATORY SECTION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-200/60 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-inner">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0A0A0B]">Обязательные предметы</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mandatorySubjects.map((subject, i) => (
                  <FadeIn key={subject.id} delay={i * 0.1}>
                    <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700" />
                      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        <div className="w-14 h-14 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div className="space-y-3">
                          <div className="text-2xl font-black uppercase tracking-tighter leading-none text-[#0A0A0B]">{subject.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic bg-white/80 px-3 py-1.5 rounded-xl border border-gray-100">Обязательно</span>
                            <Badge variant="secondary" className="rounded-xl h-7 px-3 text-[10px] font-black border border-gray-100 bg-gray-50 text-muted-foreground">{subject.maxScore} баллов</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* ELECTIVE SECTION */}
            <div className="space-y-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center text-primary shadow-inner">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0A0A0B]">Профильные предметы</h2>
                </div>
                <Badge variant="outline" className="rounded-full px-5 h-9 uppercase font-black text-[11px] tracking-widest italic shadow-sm bg-white text-[#0A0A0B] border-primary/20">
                  Выбрано: <span className="text-primary ml-1">{selectedElectives.length} / 2</span>
                </Badge>
              </div>

              {/* CATEGORIES */}
              <div className="space-y-16">
                {[
                  { title: 'Естественно-научные', icon: Beaker, data: naturalSciences, bgGlow: 'bg-blue-500/10' },
                  { title: 'Общественно-гуманитарные', icon: Globe, data: socialSciences, bgGlow: 'bg-green-500/10' },
                  { title: 'Творческие', icon: Palette, data: creative, bgGlow: 'bg-purple-500/10' }
                ].map((category, catIdx) => (
                  <div key={category.title} className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${category.bgGlow}`}><category.icon className="w-4 h-4 text-[#0A0A0B]" /></div>
                      {category.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.data.map((subject, sIdx) => {
                        const isSelected = selectedElectives.includes(subject.id);
                        const isDisabled = !isSelected && selectedElectives.length >= 2;

                        return (
                          <FadeIn key={subject.id} delay={sIdx * 0.05 + catIdx * 0.1}>
                            <Card
                              onClick={() => !isDisabled && toggleElective(subject.id)}
                              className={`rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 relative overflow-hidden group border-2 ${isSelected
                                ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]'
                                : isDisabled
                                  ? 'bg-white/40 border-white/40 opacity-50 grayscale cursor-not-allowed no-shadow hover:scale-100'
                                  : 'bg-white/60 backdrop-blur-xl border-white hover:border-primary/30 hover:bg-white shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1'
                                }`}
                            >
                              {/* Selection background transition */}
                              {isSelected && (
                                <motion.div
                                  layoutId="select-bg-subj"
                                  className="absolute inset-0 bg-gradient-to-br from-primary to-[#ff7a00] opacity-90 z-0"
                                  initial={false}
                                  transition={{ duration: 0.4 }}
                                />
                              )}

                              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="flex justify-between items-start">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSelected
                                    ? 'bg-white text-primary shadow-lg'
                                    : 'bg-gray-50 border border-gray-100 text-[#0A0A0B] group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20'
                                    }`}>
                                    {isSelected ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className={`text-2xl font-black uppercase tracking-tighter leading-none transition-colors ${isSelected ? 'text-white' : 'text-[#0A0A0B]'}`}>{subject.name}</div>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={`rounded-xl h-7 px-3 text-[10px] font-black border transition-colors ${isSelected ? 'border-white/20 text-white bg-white/10 backdrop-blur-md' : 'border-gray-100 bg-white text-muted-foreground'}`}>
                                      {subject.maxScore} баллов
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </FadeIn>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <FadeIn delay={0.4}>
              <div className="flex justify-center pt-16">
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  disabled={selectedElectives.length !== 2}
                  className={`rounded-[2.5rem] h-20 px-12 font-black text-lg uppercase tracking-widest transition-all duration-300 group ${selectedElectives.length === 2
                    ? 'bg-[#0A0A0B] text-white shadow-2xl shadow-black/20 hover:bg-black hover:scale-105'
                    : 'bg-gray-200 text-muted-foreground opacity-50'}`}
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Начать тестирование <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </div>
  );
};
