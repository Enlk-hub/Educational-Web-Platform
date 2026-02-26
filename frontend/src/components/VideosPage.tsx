import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { api } from '../api/client';
import { Subject, VideoLesson } from '../types';
import { Play, Search, Clock, Sparkles, Filter, LayoutGrid, PlayCircle, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
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

export const VideosPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getSubjects(), api.getVideos()])
      .then(([subjectData, videoData]) => {
        setSubjects(subjectData);
        setVideos(videoData);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredVideos = videos.filter(video => {
    const description = video.description || '';
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || video.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || '';
  };

  return (
    <div className="min-h-screen relative bg-[#FBFBFD] pt-32 pb-24 overflow-hidden">
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        {/* HEADER & FILTERS */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
            <div className="space-y-6">
              <FadeIn>
                <Badge variant="outline" className="rounded-full px-5 py-1.5 uppercase font-black text-[11px] tracking-widest border-primary/30 text-primary bg-primary/10 backdrop-blur-md">
                  Медиатека ENTBridge
                </Badge>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-[#0A0A0B]">
                  ВИДЕО <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">УРОКИ</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-2xl italic">
                  Эксклюзивный каталог образовательного контента.\nСмотрите более 500 часов лекций от лучших преподавателей страны.
                </p>
              </FadeIn>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-[400px]">
              <FadeIn delay={0.3}>
                <div className="relative group shadow-2xl shadow-black/5 rounded-3xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Поиск по базе знаний..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 h-16 rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl text-lg font-medium italic transition-all focus:ring-4 focus:ring-primary/20 focus:bg-white"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

          <FadeIn delay={0.4}>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest italic transition-all duration-300 whitespace-nowrap border-2 flex items-center gap-3 ${selectedSubject === null
                  ? 'bg-[#0A0A0B] border-[#0A0A0B] text-white shadow-xl shadow-black/20 scale-105'
                  : 'bg-white/50 backdrop-blur-sm border-white text-muted-foreground hover:bg-white hover:border-primary/20 hover:text-[#0A0A0B]'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" /> Все материалы
              </button>
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest italic transition-all duration-300 whitespace-nowrap border-2 flex items-center ${selectedSubject === subject.id
                    ? 'bg-[#0A0A0B] border-[#0A0A0B] text-white shadow-xl shadow-black/20 scale-105'
                    : 'bg-white/50 backdrop-blur-sm border-white text-muted-foreground hover:bg-white hover:border-primary/20 hover:text-[#0A0A0B]'
                    }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </FadeIn>
        </section>

        {loadError && (
          <FadeIn>
            <div className="py-16 text-center font-black uppercase tracking-widest text-red-500 italic bg-red-50/50 backdrop-blur-md rounded-[3rem] p-10 border border-red-100 shadow-xl shadow-red-500/5">
              {loadError}
            </div>
          </FadeIn>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/3] bg-gradient-to-br from-white to-gray-50 rounded-[3rem] border border-white shadow-xl shadow-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-20">

            {/* FEATURED BANNER */}
            {searchQuery === '' && !selectedSubject && (
              <FadeIn delay={0.5}>
                <div className="relative group rounded-[3.5rem] overflow-hidden bg-[#0A0A0B] shadow-2xl shadow-black/20 flex flex-col lg:flex-row">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent z-10" />

                  <div className="flex-1 p-12 lg:p-20 space-y-8 relative z-20 flex flex-col justify-center">
                    <Badge className="bg-white/10 text-white backdrop-blur-md border border-white/20 font-black h-8 px-5 w-fit italic text-[10px] tracking-widest uppercase">Эксклюзив</Badge>
                    <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                      БАЗОВЫЙ КУРС <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">ИСТОРИИ 2024</span>
                    </h2>
                    <div className="flex items-center gap-8 text-white/60 font-medium">
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10"><Clock className="w-5 h-5 text-primary" /> 24 урока</div>
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10"><Sparkles className="w-5 h-5 text-orange-400" /> Топ рейтинг</div>
                    </div>
                  </div>
                  <div className="flex-1 relative min-h-[400px] lg:min-h-[500px]">
                    <img src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000" alt="History" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent z-10 lg:hidden" />
                  </div>
                </div>
              </FadeIn>
            )}

            {/* VIDEOS GRID */}
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center text-primary shadow-inner">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">СВЕЖИЕ УРОКИ</h2>
                </div>
                <Badge variant="outline" className="hidden md:flex rounded-full px-4 h-8 bg-white border-gray-200 text-muted-foreground font-black text-[10px] tracking-widest uppercase">
                  {filteredVideos.length} уроков
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredVideos.map((video, i) => (
                  <FadeIn key={video.id} delay={0.2 + (i * 0.05)}>
                    <Card className="rounded-[2.5rem] border-2 border-white bg-white/50 backdrop-blur-sm p-3 shadow-xl shadow-black/5 group hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer overflow-hidden">
                      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#0A0A0B]">
                        <ImageWithFallback
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 opacity-90 group-hover:opacity-100 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 border border-white/30 shadow-2xl">
                            <Play className="w-6 h-6 fill-current ml-1" />
                          </div>
                        </div>

                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-[9px] h-7 px-4 tracking-widest uppercase shadow-lg">
                            {getSubjectName(video.subjectId)}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black text-white border border-white/10">
                          <Clock className="w-3.5 h-3.5" /> {video.duration}
                        </div>
                      </div>

                      <div className="p-5 space-y-3 relative">
                        <h4 className="text-xl font-black uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      </div>
                    </Card>
                  </FadeIn>
                ))}
              </div>

              {filteredVideos.length === 0 && (
                <FadeIn>
                  <div className="py-32 text-center space-y-6 bg-white/50 backdrop-blur-md rounded-[3.5rem] border border-white shadow-xl shadow-black/5">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="font-black text-2xl uppercase tracking-tighter text-muted-foreground/50 italic">По вашему запросу ничего не найдено</p>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* INFO FOOTER SECTION */}
            <FadeIn delay={0.6}>
              <Card className="rounded-[3.5rem] border-none bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] p-12 lg:p-16 text-white shadow-2xl shadow-black/20 relative overflow-hidden group">
                {/* Decorative glowing orbs */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-[100px] group-hover:bg-primary/40 transition-colors duration-700" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] group-hover:bg-orange-500/30 transition-colors duration-700" />

                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="space-y-6 text-center md:text-left">
                    <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                      НЕ НАШЛИ НУЖНУЮ <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">ТЕМУ?</span>
                    </h3>
                    <p className="text-white/60 font-medium text-lg max-w-xl">
                      Оставьте запрос на создание нового урока, и мы подготовим его в течение 48 часов, пополнив нашу премиальную базу знаний.
                    </p>
                  </div>
                  <button className="h-16 px-10 rounded-2xl bg-white text-[#0A0A0B] font-black uppercase tracking-widest italic text-sm hover:scale-105 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 shrink-0">
                    Оставить запрос
                  </button>
                </div>
              </Card>
            </FadeIn>
          </div>
        )}
      </div>
    </div>
  );
};
