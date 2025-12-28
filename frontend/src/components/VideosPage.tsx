import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { api } from '../api/client';
import { Subject, VideoLesson } from '../types';
import { Play, Search, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">Видеоуроки</h1>
          <p className="text-muted-foreground">
            Обучающие видео по всем предметам ЕНТ
          </p>
        </div>

        {loadError && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">{loadError}</p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск видеоуроков..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedSubject === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedSubject(null)}
            >
              Все предметы
            </Badge>
            {subjects.map(subject => (
              <Badge
                key={subject.id}
                variant={selectedSubject === subject.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedSubject(subject.id)}
              >
                {subject.name}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Загрузка видеоуроков...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/20 flex items-center justify-center group cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </a>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{video.duration}</span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{getSubjectName(video.subjectId)}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Видеоуроки не найдены. Попробуйте изменить критерии поиска.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>О видеоуроках</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Все видеоуроки созданы квалифицированными преподавателями</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Материалы соответствуют требованиям ЕНТ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Видео содержат подробные объяснения и примеры решения задач</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Регулярно добавляются новые уроки по всем предметам</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
