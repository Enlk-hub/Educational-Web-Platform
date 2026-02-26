import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useAuth } from '../contexts/AuthContext';
import { api, downloadWithAuth } from '../api/client';
import { Homework, Subject, TestResult, User, Attachment, VideoLesson, AdminStats, AdminNote, AuditLog } from '../types';
import { FileText, Users, BarChart, Plus, Calendar, CheckCircle, Edit, Trash2, PlayCircle, CheckCircle2, Circle, ListTodo, History, LayoutDashboard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from './RichTextEditor';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [isEditingHomework, setIsEditingHomework] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [reviewHomeworkId, setReviewHomeworkId] = useState<string | null>(null);
  const [newHomeworkFiles, setNewHomeworkFiles] = useState<File[]>([]);
  const [editHomeworkFiles, setEditHomeworkFiles] = useState<File[]>([]);
  const [homeworkAttachmentFiles, setHomeworkAttachmentFiles] = useState<Record<string, File[]>>({});
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
  });
  const [editHomework, setEditHomework] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
  });
  const [reviewNotes, setReviewNotes] = useState<Record<string, { feedback: string; grade: string }>>({});
  const [newSubject, setNewSubject] = useState({
    code: '',
    title: '',
    iconUrl: '',
    isMandatory: false,
    category: '',
    maxScore: '',
  });
  const [newQuestion, setNewQuestion] = useState({
    subjectId: '',
    text: '',
    explanation: '',
    points: '',
    optionsText: '',
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [importSubjectId, setImportSubjectId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importReport, setImportReport] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [adminVideos, setAdminVideos] = useState<VideoLesson[]>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLesson | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    subjectId: '',
    youtubeUrl: '',
    description: '',
    thumbnail: '',
    duration: '',
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<User | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) return;
    setIsLoading(true);
    setLoadError('');

    Promise.all([
      api.getSubjects(),
      api.admin.getUsers(),
      api.admin.getResults(),
      api.admin.getHomework(),
      api.getVideos()
    ])
      .then(([subjectData, userData, resultData, homeworkData, videoData]) => {
        setSubjects(subjectData);
        setUsers(userData);
        setResults(resultData);
        setHomework(homeworkData);
        setAdminVideos(videoData);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки данных'))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              У вас нет доступа к панели администратора
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateVideo = async () => {
    if (!videoForm.title || !videoForm.subjectId || !videoForm.youtubeUrl) {
      toast('Заполните обязательные поля: название, предмет, ссылка');
      return;
    }

    try {
      if (editingVideo) {
        const updated = await api.admin.updateVideo(editingVideo.id, videoForm);
        setAdminVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
        toast('Видеоурок обновлен');
      } else {
        const created = await api.admin.createVideo(videoForm);
        setAdminVideos(prev => [created, ...prev]);
        toast('Видеоурок добавлен');
      }
      setIsAddingVideo(false);
      setEditingVideo(null);
      setVideoForm({ title: '', subjectId: '', youtubeUrl: '', description: '', thumbnail: '', duration: '' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка при сохранении видео');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот видеоурок?')) return;
    try {
      await api.admin.deleteVideo(videoId);
      setAdminVideos(prev => prev.filter(v => v.id !== videoId));
      toast('Видеоурок удален');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  const handleAddHomework = async () => {
    if (!newHomework.title || !newHomework.description || !newHomework.subjectId || !newHomework.dueDate) {
      toast('Пожалуйста, заполните все поля');
      return;
    }

    try {
      let created = await api.admin.createHomework(newHomework);
      if (newHomeworkFiles.length > 0) {
        created = await api.admin.uploadHomeworkAttachments(created.id, newHomeworkFiles);
      }
      setHomework((prev) => [created, ...prev]);
      toast('Домашнее задание успешно добавлено');
      setIsAddingHomework(false);
      setNewHomework({
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
      });
      setNewHomeworkFiles([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка создания задания');
    }
  };

  const handleStartEditHomework = (task: Homework) => {
    setEditingHomework(task);
    setEditHomework({
      title: task.title,
      description: task.description,
      subjectId: task.subjectId,
      dueDate: task.dueDate.slice(0, 10),
    });
    setEditHomeworkFiles([]);
    setIsEditingHomework(true);
  };

  const handleUpdateHomework = async () => {
    if (!editingHomework) return;
    if (!editHomework.title || !editHomework.description || !editHomework.subjectId || !editHomework.dueDate) {
      toast('Пожалуйста, заполните все поля');
      return;
    }
    try {
      let updated = await api.admin.updateHomework(editingHomework.id, editHomework);
      if (editHomeworkFiles.length > 0) {
        updated = await api.admin.uploadHomeworkAttachments(editingHomework.id, editHomeworkFiles);
      }
      setHomework((prev) => prev.map((hw) => (hw.id === updated.id ? updated : hw)));
      toast('Задание обновлено');
      setIsEditingHomework(false);
      setEditingHomework(null);
      setEditHomeworkFiles([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка обновления задания');
    }
  };

  const handleDeleteHomework = async (task: Homework) => {
    if (!window.confirm(`Удалить задание "${task.title}"?`)) return;
    try {
      await api.admin.deleteHomework(task.id);
      setHomework((prev) => prev.filter((hw) => hw.id !== task.id));
      toast('Задание удалено');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка удаления задания');
    }
  };

  const handleReview = async (submissionId: string, status: 'NEEDS_REVISION' | 'APPROVED') => {
    const note = reviewNotes[submissionId];
    try {
      const updated = await api.admin.reviewSubmission(submissionId, {
        status,
        feedback: note?.feedback || undefined,
        grade: note?.grade ? Number(note.grade) : undefined,
      });
      setHomework((prev) =>
        prev.map((hw) => ({
          ...hw,
          submissions: hw.submissions.map((sub) => (sub.id === updated.id ? updated : sub)),
        }))
      );
      toast(status === 'APPROVED' ? 'Работа принята' : 'Отправлено на доработку');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка обновления работы');
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.code || !newSubject.title) {
      toast('Укажите код и название предмета');
      return;
    }
    try {
      const created = await api.admin.createSubject({
        code: newSubject.code,
        title: newSubject.title,
        iconUrl: newSubject.iconUrl || undefined,
        isMandatory: newSubject.isMandatory,
        category: newSubject.category || undefined,
        maxScore: newSubject.maxScore ? Number(newSubject.maxScore) : undefined,
      });
      setSubjects((prev) => [...prev, created]);
      toast('Предмет создан');
      setNewSubject({
        code: '',
        title: '',
        iconUrl: '',
        isMandatory: false,
        category: '',
        maxScore: '',
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка создания предмета');
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.subjectId || !newQuestion.text || !newQuestion.optionsText) {
      toast('Заполните предмет, вопрос и варианты ответов');
      return;
    }
    const options = newQuestion.optionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const isCorrect = line.startsWith('*');
        const text = isCorrect ? line.slice(1).trim() : line;
        return { text, isCorrect };
      });
    if (options.length < 2) {
      toast('Добавьте минимум два варианта ответа');
      return;
    }
    if (!options.some((opt) => opt.isCorrect)) {
      toast('Отметьте правильный ответ символом *');
      return;
    }
    try {
      await api.admin.createQuestion({
        subjectId: newQuestion.subjectId,
        text: newQuestion.text,
        explanation: newQuestion.explanation || undefined,
        points: newQuestion.points ? Number(newQuestion.points) : undefined,
        options,
      });
      toast('Вопрос добавлен');
      setNewQuestion({
        subjectId: '',
        text: '',
        explanation: '',
        points: '',
        optionsText: '',
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка добавления вопроса');
    }
  };

  const handleDownload = async (file: Attachment) => {
    try {
      await downloadWithAuth(file.downloadUrl, file.name);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    }
  };

  const handleImportQuestions = async () => {
    if (!importSubjectId || !importFile) {
      toast('Выберите предмет и файл');
      return;
    }
    setIsImporting(true);
    setImportReport(null);
    try {
      const report = await api.admin.importQuestions(importSubjectId, importFile);
      setImportReport(report);
      toast(`Импортировано: ${report.created}, пропущено: ${report.skipped}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      setIsImporting(false);
    }
  };


  const totalStudents = users.filter(u => !u.isAdmin).length;
  const totalTests = results.length;
  const totalHomework = homework.length;
  const resultsByStudent = results.reduce<Record<string, TestResult[]>>((acc, result) => {
    const key = result.userId || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-28 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic text-primary">
            Панель администратора
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            Центр управления платформой, контентом и успеваемостью студентов
          </p>
        </div>

        {loadError && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">{loadError}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Студентов', value: totalStudents, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
            { title: 'Пройдено тестов', value: totalTests, icon: BarChart, color: 'bg-emerald-50 text-emerald-600' },
            { title: 'Заданий', value: totalHomework, icon: FileText, color: 'bg-purple-50 text-purple-600' },
            { title: 'Активных предметов', value: subjects.length, icon: CheckCircle, color: 'bg-orange-50 text-orange-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex items-center gap-6">
              <div className={`w-14 h-14 ${stat.color} rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.title}</div>
                <div className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="homework" className="w-full">
          <TabsList className="flex flex-wrap md:inline-flex bg-gray-100 p-2 rounded-2xl gap-2 w-full md:w-auto mb-8">
            <TabsTrigger value="homework" className="rounded-xl font-black uppercase tracking-[0.05em] text-xs py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Домашние задания</TabsTrigger>
            <TabsTrigger value="subjects" className="rounded-xl font-black uppercase tracking-[0.05em] text-xs py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Предметы и видео</TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl font-black uppercase tracking-[0.05em] text-xs py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Студенты</TabsTrigger>
            <TabsTrigger value="results" className="rounded-xl font-black uppercase tracking-[0.05em] text-xs py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Результаты тестов</TabsTrigger>
            <TabsTrigger value="content" className="rounded-xl font-black uppercase tracking-[0.05em] text-xs py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Вопросы</TabsTrigger>
          </TabsList>

          <TabsContent value="homework" className="space-y-6">
            <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
              <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Управление дз</CardTitle>
                    <CardDescription className="text-base font-medium mt-2">
                      Создавайте и проверяйте домашние задания для студентов
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingHomework} onOpenChange={setIsAddingHomework}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest no-shadow">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить задание
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] p-8 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Новое домашнее задание</DialogTitle>
                        <DialogDescription className="font-medium text-base">
                          Заполните форму для создания нового задания
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Название</Label>
                          <Input
                            id="title"
                            value={newHomework.title}
                            onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                            placeholder="Например: Решение уравнений"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Описание</Label>
                          <RichTextEditor
                            value={newHomework.description}
                            onChange={(value) => setNewHomework({ ...newHomework, description: value })}
                            placeholder="Подробное описание задания..."
                            minHeight={140}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Предмет</Label>
                          <Select value={newHomework.subjectId} onValueChange={(value) => setNewHomework({ ...newHomework, subjectId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите предмет" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Срок сдачи</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newHomework.dueDate}
                            onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Файлы задания</Label>
                          <Input
                            type="file"
                            multiple
                            onChange={(event) => setNewHomeworkFiles(Array.from(event.target.files || []))}
                          />
                          {newHomeworkFiles.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Выбрано файлов: {newHomeworkFiles.length}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={handleAddHomework}>
                            Создать задание
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingHomework(false)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground font-medium">Загрузка...</div>
                ) : (
                  <div className="grid gap-6">
                    {homework.map(hw => {
                      const subject = subjects.find(s => s.id === hw.subjectId);

                      return (
                        <Card key={hw.id} className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-black tracking-tight mb-3 text-primary">{hw.title}</CardTitle>
                                <div
                                  className="text-muted-foreground font-medium rich-text-content"
                                  dangerouslySetInnerHTML={{ __html: hw.description }}
                                />
                              </div>
                              <Badge className="w-fit h-fit px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-primary/5 text-primary hover:bg-primary/10 transition-colors">{subject?.name}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 md:p-8 pt-0 md:pt-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Срок: {new Date(hw.dueDate).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>{hw.submissions.length} сдано</span>
                              </div>
                            </div>
                            {hw.attachments?.length > 0 && (
                              <div className="mt-4 space-y-1 text-sm">
                                <div className="font-medium">Файлы задания</div>
                                <div className="flex flex-col gap-1">
                                  {hw.attachments.map((file) => (
                                    <button
                                      type="button"
                                      key={file.id}
                                      className="text-left text-primary hover:underline"
                                      onClick={() => handleDownload(file)}
                                    >
                                      {file.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-4 space-y-2">
                              <Label>Добавить файлы</Label>
                              <Input
                                type="file"
                                multiple
                                onChange={(event) =>
                                  setHomeworkAttachmentFiles((prev) => ({
                                    ...prev,
                                    [hw.id]: Array.from(event.target.files || []),
                                  }))
                                }
                              />
                              {(homeworkAttachmentFiles[hw.id]?.length || 0) > 0 && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Выбрано файлов: {homeworkAttachmentFiles[hw.id].length}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        const updated = await api.admin.uploadHomeworkAttachments(hw.id, homeworkAttachmentFiles[hw.id]);
                                        setHomework((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                                        setHomeworkAttachmentFiles((prev) => ({ ...prev, [hw.id]: [] }));
                                        toast('Файлы добавлены');
                                      } catch (err) {
                                        toast(err instanceof Error ? err.message : 'Ошибка загрузки');
                                      }
                                    }}
                                  >
                                    Загрузить
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <Dialog open={reviewHomeworkId === hw.id} onOpenChange={(open) => setReviewHomeworkId(open ? hw.id : null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Просмотреть работы
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Работы студентов</DialogTitle>
                                    <DialogDescription>
                                      Проверка и обратная связь по домашним заданиям
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {hw.submissions.length === 0 ? (
                                      <div className="text-sm text-muted-foreground">Пока нет отправленных работ</div>
                                    ) : (
                                      hw.submissions.map((submission) => {
                                        const note = reviewNotes[submission.id] || {
                                          feedback: submission.feedback || '',
                                          grade: submission.grade ? String(submission.grade) : '',
                                        };
                                        const statusLabel = submission.status === 'APPROVED'
                                          ? 'Принято'
                                          : submission.status === 'NEEDS_REVISION'
                                            ? 'Нужна доработка'
                                            : 'Отправлено';
                                        return (
                                          <Card key={submission.id}>
                                            <CardHeader>
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <CardTitle className="text-base">{submission.userName}</CardTitle>
                                                  <CardDescription>
                                                    {new Date(submission.submittedAt).toLocaleDateString('ru-RU')}
                                                  </CardDescription>
                                                </div>
                                                <Badge variant={submission.status === 'NEEDS_REVISION' ? 'destructive' : 'secondary'}>
                                                  {statusLabel}
                                                </Badge>
                                              </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              <div className="text-sm text-muted-foreground">
                                                <div className="font-medium">Ответ</div>
                                                <div
                                                  className="rich-text-content"
                                                  dangerouslySetInnerHTML={{ __html: submission.content || '' }}
                                                />
                                              </div>
                                              {submission.attachments?.length > 0 && (
                                                <div className="text-sm">
                                                  <div className="font-medium">Файлы студента</div>
                                                  <div className="flex flex-col gap-1">
                                                    {submission.attachments.map((file) => (
                                                      <button
                                                        type="button"
                                                        key={file.id}
                                                        className="text-left text-primary hover:underline"
                                                        onClick={() => handleDownload(file)}
                                                      >
                                                        {file.name}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                              <div className="grid gap-3 md:grid-cols-2">
                                                <div className="space-y-2">
                                                  <Label>Комментарий</Label>
                                                  <Textarea
                                                    value={note.feedback}
                                                    onChange={(e) =>
                                                      setReviewNotes((prev) => ({
                                                        ...prev,
                                                        [submission.id]: { ...note, feedback: e.target.value },
                                                      }))
                                                    }
                                                    rows={2}
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Оценка</Label>
                                                  <Input
                                                    type="number"
                                                    value={note.grade}
                                                    onChange={(e) =>
                                                      setReviewNotes((prev) => ({
                                                        ...prev,
                                                        [submission.id]: { ...note, grade: e.target.value },
                                                      }))
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleReview(submission.id, 'NEEDS_REVISION')}
                                                >
                                                  На доработку
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleReview(submission.id, 'APPROVED')}
                                                >
                                                  Принять
                                                </Button>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" onClick={() => handleStartEditHomework(hw)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteHomework(hw)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isEditingHomework} onOpenChange={setIsEditingHomework}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать задание</DialogTitle>
                  <DialogDescription>
                    Обновите детали домашнего задания
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Название</Label>
                    <Input
                      id="edit-title"
                      value={editHomework.title}
                      onChange={(e) => setEditHomework({ ...editHomework, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Описание</Label>
                    <RichTextEditor
                      value={editHomework.description}
                      onChange={(value) => setEditHomework({ ...editHomework, description: value })}
                      minHeight={140}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Предмет</Label>
                    <Select value={editHomework.subjectId} onValueChange={(value) => setEditHomework({ ...editHomework, subjectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-dueDate">Срок сдачи</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={editHomework.dueDate}
                      onChange={(e) => setEditHomework({ ...editHomework, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Добавить файлы</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(event) => setEditHomeworkFiles(Array.from(event.target.files || []))}
                    />
                    {editHomeworkFiles.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Выбрано файлов: {editHomeworkFiles.length}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleUpdateHomework}>
                      Сохранить
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingHomework(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Новый предмет</CardTitle>
                  <CardDescription className="text-base font-medium mt-2">
                    Создайте предмет, чтобы он появился в списках
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 pb-0">
                  <div className="space-y-2">
                    <Label htmlFor="subject-code">Код предмета</Label>
                    <Input
                      id="subject-code"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                      placeholder="например: physics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject-title">Название</Label>
                    <Input
                      id="subject-title"
                      value={newSubject.title}
                      onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                      placeholder="например: Физика"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject-icon">Ссылка на иконку</Label>
                    <Input
                      id="subject-icon"
                      value={newSubject.iconUrl}
                      onChange={(e) => setNewSubject({ ...newSubject, iconUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Обязательный</Label>
                      <Select
                        value={newSubject.isMandatory ? 'true' : 'false'}
                        onValueChange={(value) => setNewSubject({ ...newSubject, isMandatory: value === 'true' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Да</SelectItem>
                          <SelectItem value="false">Нет</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-max-score">Макс. балл</Label>
                      <Input
                        id="subject-max-score"
                        type="number"
                        value={newSubject.maxScore}
                        onChange={(e) => setNewSubject({ ...newSubject, maxScore: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject-category">Категория</Label>
                    <Select
                      value={newSubject.category || 'none'}
                      onValueChange={(value) => setNewSubject({ ...newSubject, category: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural-sciences">Естественные науки</SelectItem>
                        <SelectItem value="social-sciences">Социальные науки</SelectItem>
                        <SelectItem value="creative">Творческий экзамен</SelectItem>
                        <SelectItem value="none">Не указывать</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateSubject}>
                    Создать предмет
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    Управление видео
                  </CardTitle>
                  <CardDescription className="text-base font-medium mt-2">
                    Добавление и редактирование видеоуроков
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-0 pb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Список видеоуроков</h3>
                    <Button onClick={() => setIsAddingVideo(true)} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> Добавить видео
                    </Button>
                  </div>

                  {(isAddingVideo || editingVideo) && (
                    <Card className="bg-muted/30 border-dashed mb-6">
                      <CardHeader>
                        <CardTitle className="text-base">{editingVideo ? 'Редактировать видео' : 'Новый видеоурок'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Название</Label>
                            <Input
                              value={videoForm.title}
                              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                              placeholder="Напр: Введение в органическую химию"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Предмет</Label>
                            <Select
                              value={videoForm.subjectId}
                              onValueChange={(value) => setVideoForm({ ...videoForm, subjectId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите предмет" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Ссылка на YouTube</Label>
                          <Input
                            value={videoForm.youtubeUrl}
                            onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ссылка на превью (Thumbnail)</Label>
                            <Input
                              value={videoForm.thumbnail}
                              onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Длительность</Label>
                            <Input
                              value={videoForm.duration}
                              onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                              placeholder="напр. 10:45"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Описание (необязательно)</Label>
                          <Textarea
                            value={videoForm.description}
                            onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" onClick={() => {
                            setIsAddingVideo(false);
                            setEditingVideo(null);
                            setVideoForm({ title: '', subjectId: '', youtubeUrl: '', description: '', thumbnail: '', duration: '' });
                          }}>Отмена</Button>
                          <Button onClick={handleCreateVideo}>
                            {editingVideo ? 'Обновить' : 'Сохранить'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Название</TableHead>
                          <TableHead>Длительность</TableHead>
                          <TableHead>Предмет</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminVideos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Видеоуроки не найдены
                            </TableCell>
                          </TableRow>
                        ) : (
                          adminVideos.map((video) => (
                            <TableRow key={video.id}>
                              <TableCell className="font-medium">{video.title}</TableCell>
                              <TableCell>{video.duration || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {subjects.find(s => s.id === video.subjectId)?.name || video.subjectId}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingVideo(video);
                                      setVideoForm({
                                        title: video.title,
                                        subjectId: video.subjectId,
                                        youtubeUrl: video.youtubeUrl,
                                        description: video.description || '',
                                        thumbnail: video.thumbnail || '',
                                        duration: video.duration || '',
                                      });
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteVideo(video.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="rounded-[2.5rem] border-none bg-white p-6 no-shadow">
              <CardHeader className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Список студентов</CardTitle>
                  <CardDescription className="font-medium italic">
                    Все зарегистрированные студенты на платформе
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Users className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Input
                    placeholder="Поиск по имени или email..."
                    className="pl-10 h-11 rounded-2xl border-gray-100 bg-gray-50/50 no-shadow"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-gray-50 hover:bg-transparent">
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground py-4">Студент</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground py-4">Email / Никнейм</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground py-4">Регистрация</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground py-4 text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(u => !u.isAdmin)
                        .filter(u =>
                          u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          u.username.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map(student => (
                          <TableRow key={student.id} className="border-gray-50 hover:bg-gray-50/30 transition-colors group">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xs uppercase">
                                  {student.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="font-black uppercase tracking-tighter italic text-sm">{student.name}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">{student.email}</span>
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">@{student.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-sm italic text-muted-foreground">
                              {new Date(student.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedStudentForAnalytics(student)}
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 group-hover:bg-primary group-hover:text-white transition-all">
                                Аналитика <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {selectedStudentForAnalytics && (
                    <Dialog open={!!selectedStudentForAnalytics} onOpenChange={(open) => !open && setSelectedStudentForAnalytics(null)}>
                      <DialogContent className="max-w-2xl rounded-[2rem] p-8">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                            Аналитика: {selectedStudentForAnalytics.name}
                          </DialogTitle>
                          <DialogDescription className="font-medium text-base">
                            Подробная статистика по пройденным тестам
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                          {resultsByStudent[selectedStudentForAnalytics.id]?.length ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Предмет</TableHead>
                                  <TableHead>Балл</TableHead>
                                  <TableHead>Верных ответов</TableHead>
                                  <TableHead>Дата</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {resultsByStudent[selectedStudentForAnalytics.id].map(result => {
                                  const percentage = Math.round((result.score / result.maxScore) * 100);
                                  return (
                                    <TableRow key={result.id}>
                                      <TableCell className="font-medium">{result.subjectName}</TableCell>
                                      <TableCell>
                                        <Badge variant={percentage >= 75 ? 'default' : 'secondary'} className="rounded-lg">
                                          {result.score} / {result.maxScore}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {result.correctAnswers} из {result.totalQuestions}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {new Date(result.date).toLocaleDateString('ru-RU')}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-2xl">
                              Этот студент еще не проходил тесты
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
              <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Результаты тестов</CardTitle>
                <CardDescription className="text-base font-medium mt-2">
                  Результаты всех пройденных тестов
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {results.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Результатов пока нет</div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(resultsByStudent).map(([studentId, studentResults]) => {
                      const student = users.find(u => u.id === studentId);
                      const name = student?.name || 'Unknown';
                      return (
                        <AccordionItem key={studentId} value={studentId}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                              <span>{name}</span>
                              <Badge variant="secondary">{studentResults.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Предмет</TableHead>
                                  <TableHead>Балл</TableHead>
                                  <TableHead>Правильных ответов</TableHead>
                                  <TableHead>Дата</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {studentResults.map(result => {
                                  const percentage = Math.round((result.score / result.maxScore) * 100);
                                  return (
                                    <TableRow key={result.id}>
                                      <TableCell>{result.subjectName}</TableCell>
                                      <TableCell>
                                        <Badge variant={percentage >= 75 ? 'default' : 'secondary'}>
                                          {result.score} / {result.maxScore}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {result.correctAnswers} / {result.totalQuestions}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(result.date).toLocaleDateString('ru-RU')}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Новый вопрос</CardTitle>
                  <CardDescription className="text-base font-medium mt-2">
                    Варианты ответов вводите построчно, правильный отметьте символом *
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 pb-0">
                  <div className="space-y-2">
                    <Label htmlFor="question-subject">Предмет</Label>
                    <Select
                      value={newQuestion.subjectId}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-text">Текст вопроса</Label>
                    <Textarea
                      id="question-text"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-explanation">Пояснение</Label>
                    <Textarea
                      id="question-explanation"
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-points">Баллы</Label>
                    <Input
                      id="question-points"
                      type="number"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-options">Варианты ответа</Label>
                    <Textarea
                      id="question-options"
                      value={newQuestion.optionsText}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionsText: e.target.value })}
                      placeholder="*Правильный вариант\nНеправильный вариант"
                      rows={6}
                    />
                  </div>
                  <Button onClick={handleCreateQuestion}>
                    Добавить вопрос
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none bg-white p-6 md:p-8 no-shadow shadow-sm">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Импорт вопросов</CardTitle>
                  <CardDescription className="text-base font-medium mt-2">
                    Загрузите Excel с колонками: ID, Вопрос, Ответ 1-4, Комментарий
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 pb-0">
                  <div className="space-y-2">
                    <Label>Предмет</Label>
                    <Select
                      value={importSubjectId}
                      onValueChange={(value) => setImportSubjectId(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Файл .xlsx или .xls</Label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleImportQuestions} disabled={isImporting}>
                    {isImporting ? 'Импорт...' : 'Импортировать'}
                  </Button>
                  {importReport && (
                    <div className="text-sm text-muted-foreground">
                      <div>Импортировано: {importReport.created}</div>
                      <div>Пропущено: {importReport.skipped}</div>
                      {importReport.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {importReport.errors.map((error, index) => (
                            <div key={`${error}-${index}`}>{error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
