import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, downloadWithAuth } from '../api/client';
import { Attachment, Homework, Subject, TestResult, AdminStats, AdminNote, AuditLog } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import {
  User, Calendar, Mail, Award, TrendingUp, History, CheckCircle2,
  Circle, LayoutDashboard, Plus, Trash2, ShieldCheck,
  Clock, BookOpen, GraduationCap, ArrowUpRight, ChevronRight,
  Zap, Settings, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from './RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from './ui/textarea';

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [results, setResults] = useState<TestResult[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTask, setSelectedTask] = useState<Homework | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFiles, setSubmitFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homeworkDrafts, setHomeworkDrafts] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homeworkFiles, setHomeworkFiles] = useState<Record<string, File[]>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homeworkSubmittingId, setHomeworkSubmittingId] = useState<string | null>(null);
  const [homeworkLoading, setHomeworkLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homeworkError, setHomeworkError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadError, setLoadError] = useState('');

  // Admin Profile Features
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [adminActivity, setAdminActivity] = useState<AuditLog[]>([]);
  const [adminHomework, setAdminHomework] = useState<Homework[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user || user.isAdmin) return;
    setIsLoading(true);
    // setLoadError('');
    api.getProfileResults(0, 50)
      .then((data) => setResults(data.content))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.isAdmin) return;
    setHomeworkLoading(true);
    // setHomeworkError('');
    Promise.all([api.getHomework(), api.getSubjects()])
      .then(([homeworkData, subjectData]) => {
        setHomework(homeworkData);
        setSubjects(subjectData);
      })
      .catch((err) => console.error(err))
      .finally(() => setHomeworkLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    setIsLoading(true);

    Promise.all([
      api.admin.getProfileStats(),
      api.admin.getNotes(),
      api.admin.getActivity(),
      api.admin.getHomework()
    ])
      .then(([stats, notes, activity, hw]) => {
        setAdminStats(stats);
        setAdminNotes(notes);
        setAdminActivity(activity);
        setAdminHomework(hw);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-black uppercase tracking-widest text-muted-foreground">Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  const handleSave = async () => {
    const updated = await updateProfile(formData);
    if (updated) {
      setIsEditing(false);
      toast.success('Профиль успешно обновлен');
    } else {
      toast.error('Не удалось обновить профиль');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Пароли не совпадают');
      return;
    }

    try {
      await api.changePassword(passwordForm.current, passwordForm.next);
      toast.success('Пароль успешно изменен');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка смены пароля');
    }
  };

  const totalTests = results.length;
  const averageScore = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / totalTests)
    : 0;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  const getSubmissionStatusLabel = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'Принято';
      case 'NEEDS_REVISION': return 'Доработка';
      case 'SUBMITTED': return 'На проверке';
      default: return 'Не сдано';
    }
  };

  const getSubmissionColor = (status?: string) => {
    if (status === 'APPROVED') return 'text-green-600 bg-green-50 border-green-100';
    if (status === 'NEEDS_REVISION') return 'text-orange-600 bg-orange-50 border-orange-100';
    if (status === 'SUBMITTED') return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const note = await api.admin.createNote(newNote);
      setAdminNotes([note, ...adminNotes]);
      setNewNote('');
      toast.success('Заметка добавлена');
    } catch (err) {
      toast.error('Не удалось создать заметку');
    }
  };

  const toggleNote = async (note: AdminNote) => {
    try {
      const updated = await api.admin.updateNote(note.id, { completed: !note.completed });
      setAdminNotes(adminNotes.map(n => n.id === note.id ? updated : n));
    } catch (err) {
      toast.error('Ошибка обновления');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await api.admin.deleteNote(noteId);
      setAdminNotes(adminNotes.filter(n => n.id !== noteId));
      toast.success('Заметка удалена');
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const handleSubmitHomework = async () => {
    if (!selectedTask) return;
    if (!submitContent.trim() && submitFiles.length === 0) {
      toast.error('Добавьте текст или файл');
      return;
    }
    setIsSubmitting(true);
    try {
      const submission = await api.submitHomework(selectedTask.id, submitContent, submitFiles);
      setHomework(prev => prev.map(t =>
        t.id === selectedTask.id
          ? { ...t, submissions: [submission] }
          : t
      ));
      setSelectedTask(prev => prev ? { ...prev, submissions: [submission] } : null);
      setSubmitContent('');
      setSubmitFiles([]);
      toast.success('Работа успешно отправлена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  interface Notification { id: string; type: string; title: string; message: string; date: Date; }

  const studentNotifications: Notification[] = user?.isAdmin ? [] : homework.flatMap<Notification>(task => {
    const notifs: Notification[] = [];
    const submission = task.submissions?.[0];

    if (!submission && new Date(task.dueDate) > new Date()) {
      notifs.push({
        id: `new-${task.id}`,
        type: 'new',
        title: '\u041d\u043e\u0432\u043e\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u0435',
        message: `\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0437\u0430\u0434\u0430\u043d\u0438\u0435 "${task.title}". \u0421\u0440\u043e\u043a \u0441\u0434\u0430\u0447\u0438: ${new Date(task.dueDate).toLocaleDateString('ru-RU')}`,
        date: new Date()
      });
    }

    if (submission && (submission.status === 'APPROVED' || submission.status === 'NEEDS_REVISION')) {
      notifs.push({
        id: `checked-${task.id}`,
        type: submission.status === 'APPROVED' ? 'success' : 'warning',
        title: submission.status === 'APPROVED' ? '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043e' : '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0434\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0430',
        message: `\u0412\u0430\u0448\u0430 \u0440\u0430\u0431\u043e\u0442\u0430 "${task.title}" \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u0430.`,
        date: new Date(submission.submittedAt)
      });
    }

    return notifs;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const adminNotifications: Notification[] = !user?.isAdmin ? [] : adminHomework.flatMap<Notification>(task => {
    const pending = task.submissions.filter(s => s.status === 'SUBMITTED');
    return pending.map(s => ({
      id: `admin-pending-${s.id}`,
      type: 'new',
      title: '\u041d\u043e\u0432\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430',
      message: `${s.userName || '\u0421\u0442\u0443\u0434\u0435\u043d\u0442'} \u0441\u0434\u0430\u043b \u0440\u0430\u0431\u043e\u0442\u0443 \u00ab${task.title}\u00bb. \u041e\u0436\u0438\u0434\u0430\u0435\u0442 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438.`,
      date: new Date(s.submittedAt)
    }));
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen relative bg-[#FBFBFD] pt-32 pb-24 overflow-hidden">
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">

        {/* HEADER SECTION */}
        <section className="mb-16">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-10">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary via-orange-400 to-primary rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                  <div className="relative w-28 h-28 bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] flex items-center justify-center rounded-[2rem] text-white text-4xl font-black tracking-tighter shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-105 group-active:scale-95 cursor-default select-none border border-white/10">
                    {initials}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#0A0A0B]">
                      {user.name}
                    </h1>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'} className={`rounded-xl px-4 py-1.5 uppercase font-black text-[11px] tracking-widest border-none w-fit shadow-md ${user.isAdmin ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                      {user.isAdmin ? <ShieldCheck className="w-4 h-4 mr-2" /> : <GraduationCap className="w-4 h-4 mr-2" />}
                      {user.isAdmin ? 'ADMIN' : 'STUDENT'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2 font-medium text-lg italic bg-white/50 w-fit px-4 py-1.5 rounded-full border border-gray-100">
                    <Mail className="w-4 h-4" /> {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center rounded-2xl h-14 px-6 font-black text-xs uppercase tracking-widest bg-white/80 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-white transition-all relative border border-transparent cursor-pointer select-none"
                    >
                      <Bell className="w-5 h-5 mr-3 text-primary" /> Уведомления ({user?.isAdmin ? adminNotifications.length : studentNotifications.length})
                      {user?.isAdmin && adminNotifications.length > 0 && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
                      )}
                      {!user?.isAdmin && studentNotifications.length > 0 && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-96 p-0 rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/10"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="font-black uppercase tracking-tighter text-[#0A0A0B]">Уведомления</h4>
                      {user?.isAdmin && adminNotifications.length > 0 && (
                        <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">{adminNotifications.length} новых</span>
                      )}
                      {!user?.isAdmin && studentNotifications.length > 0 && (
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{studentNotifications.length} новых</span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {user?.isAdmin ? (
                        adminNotifications.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground font-medium italic text-sm">Уведомлений нет</div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {adminNotifications.map(notif => (
                              <div
                                key={notif.id}
                                className="p-4 rounded-2xl border bg-blue-50 border-blue-200"
                              >
                                <h5 className="font-black text-[10px] uppercase tracking-widest mb-1 text-blue-700">{notif.title}</h5>
                                <p className="text-sm font-semibold text-[#0A0A0B] leading-snug">{notif.message}</p>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        studentNotifications.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground font-medium italic text-sm">\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439 \u043d\u0435\u0442</div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {studentNotifications.map(notif => (
                              <div
                                key={notif.id}
                                className={`p-4 rounded-2xl border ${notif.type === 'success' ? 'bg-green-50 border-green-200' :
                                  notif.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                                    'bg-blue-50 border-blue-200'
                                  }`}
                              >
                                <h5 className={`font-black text-[10px] uppercase tracking-widest mb-1 ${notif.type === 'success' ? 'text-green-700' :
                                  notif.type === 'warning' ? 'text-orange-700' :
                                    'text-blue-700'
                                  }`}>{notif.title}</h5>
                                <p className="text-sm font-semibold text-[#0A0A0B] leading-snug">{notif.message}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={() => {
                    setActiveTab('overview');
                    setIsEditing(true);
                    setTimeout(() => {
                      const el = document.getElementById('profile-info-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-[#0A0A0B] text-white hover:bg-black"
                >
                  <Settings className="w-5 h-5 mr-3" /> Настройки
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user.isAdmin ? (
              <>
                <FadeIn delay={0.1}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <LayoutDashboard className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-[#0A0A0B]">{adminStats?.questionsCreated || 0}</div>
                        <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Создано вопросов</div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-green-500/10 text-green-600 border border-green-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-[#0A0A0B]">{adminStats?.homeworkReviewed || 0}</div>
                        <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Проверено работ</div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <History className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-[#0A0A0B]">{adminStats?.totalActions || 0}</div>
                        <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Действий</div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] p-2 shadow-2xl shadow-black/20 group hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-primary/20 blur-3xl rounded-full" />
                    <CardContent className="p-6 flex items-center gap-6 text-white relative z-10">
                      <div className="w-16 h-16 bg-white/10 text-white border border-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                        <Zap className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">PREMIUM</div>
                        <div className="text-[11px] font-black text-white/50 uppercase tracking-widest">Статус системы</div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </>
            ) : (
              <>
                <FadeIn delay={0.1}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="text-4xl font-black tracking-tighter leading-none text-[#0A0A0B]">{totalTests}</div>
                        <div className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg w-fit">Тестов сдано</div>
                      </div>
                      <div className="w-16 h-16 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <History className="w-7 h-7" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="text-4xl font-black tracking-tighter leading-none text-[#0A0A0B]">{averageScore}%</div>
                        <div className="text-[11px] font-black text-green-600 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg w-fit">Средний балл</div>
                      </div>
                      <div className="w-16 h-16 bg-green-500/10 text-green-600 border border-green-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-7 h-7" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <Card className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-2 shadow-xl shadow-black/5 group hover:-translate-y-1 transition-transform">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="text-4xl font-black tracking-tighter leading-none text-[#0A0A0B]">{totalScore}</div>
                        <div className="text-[11px] font-black text-purple-600 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-lg w-fit">Всего очков</div>
                      </div>
                      <div className="w-16 h-16 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Award className="w-7 h-7" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary to-orange-400 p-2 shadow-2xl shadow-primary/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-[-20%] w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
                    <CardContent className="p-6 flex items-center justify-between relative z-10 text-white">
                      <div className="space-y-2">
                        <div className="text-4xl font-black tracking-tighter leading-none">RANK <span className="text-black/50">#</span>12</div>
                        <div className="text-[11px] font-black text-[#0A0A0B] uppercase tracking-widest bg-white/40 backdrop-blur-md px-3 py-1 rounded-lg w-fit border border-white/30">Твоя позиция</div>
                      </div>
                      <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                        <ArrowUpRight className="w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </>
            )}
          </div>
        </section>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
            <FadeIn delay={0.5}>
              <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-4 -mb-4">
                <TabsList className="bg-transparent space-x-2 h-14 w-full md:w-auto justify-start rounded-full p-1 bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5">
                  <TabsTrigger value="overview" className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#0A0A0B] data-[state=active]:text-white data-[state=active]:shadow-xl text-muted-foreground hover:text-[#0A0A0B] transition-all duration-300">Обзор</TabsTrigger>
                  {user.isAdmin ? (
                    <>
                      <TabsTrigger value="notes" className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#0A0A0B] data-[state=active]:text-white data-[state=active]:shadow-xl text-muted-foreground hover:text-[#0A0A0B] transition-all duration-300">Заметки</TabsTrigger>
                      <TabsTrigger value="activity" className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#0A0A0B] data-[state=active]:text-white data-[state=active]:shadow-xl text-muted-foreground hover:text-[#0A0A0B] transition-all duration-300">Активность</TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger value="homework" className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#0A0A0B] data-[state=active]:text-white data-[state=active]:shadow-xl text-muted-foreground hover:text-[#0A0A0B] transition-all duration-300">Задания</TabsTrigger>
                      <TabsTrigger value="history" className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#0A0A0B] data-[state=active]:text-white data-[state=active]:shadow-xl text-muted-foreground hover:text-[#0A0A0B] transition-all duration-300">История</TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>
            </FadeIn>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings Card */}
                <div className="lg:col-span-1 space-y-8">
                  <FadeIn delay={0.2}>
                    <Card id="profile-info-card" className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter text-[#0A0A0B]">Информация</CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Имя</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              disabled={!isEditing}
                              className="h-14 rounded-2xl border-white bg-white/50 backdrop-blur-sm shadow-inner font-medium text-[#0A0A0B] focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:bg-gray-50"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
                            <Input
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              disabled={!isEditing}
                              className="h-14 rounded-2xl border-white bg-white/50 backdrop-blur-sm shadow-inner font-medium text-[#0A0A0B] focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:bg-gray-50"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Дата регистрации</Label>
                            <div className="flex items-center gap-3 text-sm font-semibold h-14 px-4 rounded-2xl border-2 border-white bg-white/60 text-[#0A0A0B] shadow-inner">
                              <Calendar className="w-5 h-5 text-primary" />
                              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isEditing && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 overflow-hidden">
                              <Button onClick={handleSave} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">Сохранить изменения</Button>
                              <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-full mt-3 rounded-2xl h-14 font-black uppercase tracking-widest text-xs hover:bg-black/5">Отмена</Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </FadeIn>

                  <FadeIn delay={0.4}>
                    <Card className="rounded-[3rem] border-none bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] p-8 shadow-2xl shadow-black/20 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                      <CardHeader className="px-0 pt-0 relative z-10">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Безопасность</CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 space-y-6 relative z-10">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-1">Новый пароль</Label>
                          <Input
                            type="password"
                            value={passwordForm.next}
                            onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                            className="h-14 rounded-2xl border-white/10 bg-white/5 shadow-inner text-white focus:bg-white/10 focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                          />
                        </div>
                        <Button onClick={handleChangePassword} variant="secondary" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform bg-white/10 text-white hover:bg-white/20 border-white/10 shadow-lg">Сменить пароль</Button>
                      </CardContent>
                    </Card>
                  </FadeIn>
                </div>

                {/* Main Content Info */}
                <div className="lg:col-span-2 space-y-8">
                  {user.isAdmin ? (
                    <FadeIn delay={0.3}>
                      <Card className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 lg:min-h-[600px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <CardHeader className="px-0 pt-0 relative z-10">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center justify-between text-[#0A0A0B]">
                            Последняя активность
                            <Button variant="outline" className="rounded-xl h-9 px-5 text-[11px] font-black uppercase tracking-widest bg-white/80 shadow-sm border-white hover:bg-white text-muted-foreground transition-all">См. все</Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 pt-4 space-y-6 relative z-10">
                          {adminActivity.slice(0, 5).map((log) => (
                            <div key={log.id} className="flex gap-5 group cursor-pointer hover:translate-x-2 transition-transform duration-300">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-500 group-hover:shadow-lg group-hover:shadow-primary/20 shrink-0">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div className="flex-1 border-b border-gray-100/50 pb-5">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-black text-sm uppercase tracking-tighter italic text-[#0A0A0B] group-hover:text-primary transition-colors">
                                    {log.action === 'CREATED_QUESTION' && 'ДОБАВЛЕН ВОПРОС'}
                                    {log.action === 'REVIEWED_HOMEWORK' && 'ПРОВЕРЕНА РАБОТА'}
                                    {log.action === 'CREATED_SUBJECT' && 'НОВЫЙ ПРЕДМЕТ'}
                                    {!['CREATED_QUESTION', 'REVIEWED_HOMEWORK', 'CREATED_SUBJECT'].includes(log.action) && log.action}
                                  </h4>
                                  <span className="text-[10px] font-black text-muted-foreground/60 bg-white/50 px-2 py-1 rounded-lg border border-gray-100">{new Date(log.createdAt).toLocaleTimeString('ru-RU')}</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium mt-1.5">{log.details}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ) : (
                    <>
                      <FadeIn delay={0.3}>
                        <Card className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                          <CardHeader className="px-0 pt-0 relative z-10">
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-[#0A0A0B]">Текущий прогресс</CardTitle>
                          </CardHeader>
                          <CardContent className="px-0 pt-4 space-y-8 relative z-10">
                            {subjects.slice(0, 3).map((sub, i) => (
                              <div key={sub.id} className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <div className="font-black text-lg uppercase tracking-tighter text-[#0A0A0B] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    {sub.name}
                                  </div>
                                  <div className="text-[11px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">85% COMPLETE</div>
                                </div>
                                <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner border border-gray-100 relative">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${85 - (i * 10)}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                                  />
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </FadeIn>

                      <FadeIn delay={0.4}>
                        <Card className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-4 shadow-xl shadow-black/5 overflow-hidden group">
                          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                            <div className="p-8 space-y-5 flex flex-col justify-center">
                              <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 font-black h-7 px-4 tracking-widest text-[9px] w-fit shadow-sm rounded-xl">СРОЧНО</Badge>
                              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-[#0A0A0B]">Предметная подготовка</h3>
                              <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">У вас есть невыполненные задания по предметам. Рекомендуем завершить их как можно скорее.</p>
                              <Button
                                onClick={() => setActiveTab('homework')}
                                className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 w-fit hover:scale-[1.02] transition-transform"
                              >Перейти к заданиям</Button>
                            </div>
                            <div className="relative bg-[#0A0A0B] min-h-[220px] rounded-[2rem] overflow-hidden m-2 border border-white/10">
                              <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" alt="Learning" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent opacity-80" />
                              <div className="absolute bottom-6 left-6 right-6">
                                <div className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">СОВЕТ ДНЯ</div>
                                <div className="text-white font-bold leading-tight italic">Регулярная практика увеличивает шансы на 40%</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </FadeIn>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="homework">
              <FadeIn>
                <div className="space-y-6">
                  {homeworkLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-muted-foreground font-black uppercase tracking-widest text-lg italic opacity-50 gap-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      Загрузка заданий...
                    </div>
                  ) : homework.length === 0 ? (
                    <div className="py-24 text-center text-muted-foreground font-black uppercase tracking-widest text-lg italic opacity-50 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-inner">Заданий пока нет</div>
                  ) : (
                    homework.map(task => {
                      const submission = task.submissions[0];
                      const status = submission?.status;

                      return (
                        <Card key={task.id} className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1 hover:shadow-primary/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
                          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="flex-1 space-y-5">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="rounded-xl border-gray-100 bg-white px-4 py-1.5 font-black text-[11px] uppercase tracking-widest shadow-sm text-primary">
                                  {subjects.find(s => s.id === task.subjectId)?.name}
                                </Badge>
                                <div className={`px-4 py-1.5 rounded-xl border flex items-center text-[11px] font-black uppercase tracking-widest shadow-sm ${getSubmissionColor(status)}`}>
                                  {getSubmissionStatusLabel(status)}
                                </div>
                              </div>
                              <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors text-[#0A0A0B]">{task.title}</h3>
                              <div className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: task.description }} />
                            </div>
                            <div className="w-full md:w-auto flex flex-col items-end gap-4 shrink-0">
                              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 bg-white/80 border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                                <Clock className="w-4 h-4 text-primary" /> Срок: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setSubmitContent('');
                                  setSubmitFiles([]);
                                }}
                                className="w-full md:w-auto rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 group-hover:bg-[#0A0A0B] group-hover:text-white transition-all"
                              >
                                Открыть задание <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </FadeIn>
            </TabsContent>

            <TabsContent value="history">
              <FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 py-24 text-center text-muted-foreground font-black uppercase tracking-widest text-lg italic opacity-50 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-inner">История пуста</div>
                  ) : (
                    results.map(res => {
                      const percentage = Math.round((res.score / res.maxScore) * 100);
                      return (
                        <Card key={res.id} className="rounded-[2.5rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 group hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter leading-none text-[#0A0A0B] group-hover:text-primary transition-colors">{res.subjectName}</h4>
                                <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mt-2 bg-white/80 px-3 py-1 rounded-lg border border-gray-100 w-fit">
                                  {new Date(res.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                </div>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#0A0A0B] font-black text-lg group-hover:scale-110 transition-transform duration-500">
                                {percentage}%
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Баллы</span>
                                <span className="text-[#0A0A0B] bg-white px-3 py-1 rounded-lg shadow-sm">{res.score} / {res.maxScore}</span>
                              </div>
                              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </FadeIn>
            </TabsContent>

            {user.isAdmin && (
              <>
                <TabsContent value="notes">
                  <FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-1">
                        <Card className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5 sticky top-36">
                          <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-[#0A0A0B]">Новая задача</CardTitle>
                          </CardHeader>
                          <form onSubmit={handleCreateNote} className="space-y-6">
                            <Textarea
                              placeholder="Что нужно сделать?"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              className="rounded-3xl border-white bg-white/50 backdrop-blur-sm shadow-inner min-h-[140px] p-6 font-medium text-[#0A0A0B] focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                            <Button type="submit" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">Добавить</Button>
                          </form>
                        </Card>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        {adminNotes.length === 0 ? (
                          <div className="py-24 text-center font-black uppercase tracking-widest text-lg text-muted-foreground/50 italic bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-inner">Список задач пуст</div>
                        ) : (
                          adminNotes.map(note => (
                            <Card key={note.id} className={`rounded-[2rem] border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 ${note.completed ? 'bg-white/40 border-white/40 opacity-70' : 'bg-white/80 border-white shadow-md backdrop-blur-xl text-[#0A0A0B]'}`}>
                              <div className="flex items-center gap-5 p-6 md:px-8">
                                <button onClick={() => toggleNote(note)} className={`w-10 h-10 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-sm ${note.completed ? 'bg-green-500 border-green-500 text-white scale-[0.95]' : 'border-gray-200 bg-white text-transparent hover:border-primary/50 hover:bg-primary/5'}`}>
                                  <CheckCircle2 className={`w-6 h-6 transition-all duration-300 ${note.completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                </button>
                                <span className={`flex-1 font-semibold text-base transition-colors duration-300 ${note.completed ? 'line-through text-muted-foreground italic' : ''}`}>{note.content}</span>
                                <Button onClick={() => deleteNote(note.id)} variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:bg-red-500/10 hover:text-red-600 w-10 h-10 shrink-0">
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </FadeIn>
                </TabsContent>

                <TabsContent value="activity">
                  <FadeIn>
                    <Card className="rounded-[3rem] border-2 border-white bg-white/60 backdrop-blur-xl p-6 md:p-10 shadow-xl shadow-black/5">
                      <div className="space-y-10 relative">
                        <div className="absolute left-8 top-10 bottom-10 w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />
                        {adminActivity.map((log, i) => (
                          <div key={log.id} className="flex gap-6 md:gap-10 group relative z-10">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-16 h-16 rounded-[2rem] bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                <Zap className="w-7 h-7" />
                              </div>
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <h4 className="font-black text-xl uppercase tracking-tighter italic leading-none text-[#0A0A0B]">{log.action.replace('_', ' ')}</h4>
                                  <Badge variant="outline" className="rounded-xl text-[9px] font-black tracking-widest px-3 py-1 shadow-sm border-gray-100 bg-white text-muted-foreground">{log.entityType}</Badge>
                                </div>
                                <span className="text-xs font-black text-muted-foreground/60 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm w-fit">{new Date(log.createdAt).toLocaleString('ru-RU')}</span>
                              </div>
                              <p className="text-base font-medium text-muted-foreground italic leading-relaxed bg-white/50 p-5 rounded-2xl border border-white shadow-inner">{log.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </FadeIn>
                </TabsContent>
              </>
            )}
          </Tabs>
        </section>

      </div>

      {/* Homework Task Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedTask && (() => {
            const submission = selectedTask.submissions?.[0];
            const subjectName = subjects.find(s => s.id === selectedTask.subjectId)?.name;
            const canSubmit = !submission || submission.status === 'NEEDS_REVISION';
            return (
              <>
                <div className="bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1D] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                  <DialogHeader className="relative z-10">
                    {subjectName && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">{subjectName}</div>
                    )}
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white leading-tight">
                      {selectedTask.title}
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getSubmissionColor(submission?.status)}`}>
                        {getSubmissionStatusLabel(submission?.status)}
                      </div>
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Срок: {new Date(selectedTask.dueDate).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </DialogHeader>
                </div>

                <ScrollArea className="max-h-[55vh]">
                  <div className="p-8 space-y-6">
                    {/* Task description */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Описание задания</div>
                      <div
                        className="text-sm font-medium text-[#0A0A0B] leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedTask.description }}
                      />
                    </div>

                    {/* Admin feedback if exists */}
                    {submission?.feedback && (
                      <div className={`p-5 rounded-2xl border ${submission.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${submission.status === 'APPROVED' ? 'text-green-700' : 'text-orange-700'}`}>
                          Отзыв преподавателя
                        </div>
                        <p className="text-sm font-semibold text-[#0A0A0B]">{submission.feedback}</p>
                        {submission.grade != null && (
                          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Оценка: <span className="text-[#0A0A0B]">{submission.grade}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Previous submitted answer */}
                    {submission?.content && (
                      <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          {submission.status === 'NEEDS_REVISION' ? 'Ваш предыдущий ответ' : 'Ваш ответ'}
                        </div>
                        <div className="text-sm font-medium text-[#0A0A0B] leading-relaxed" dangerouslySetInnerHTML={{ __html: submission.content }} />
                      </div>
                    )}

                    {/* Submit form */}
                    {canSubmit && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {submission?.status === 'NEEDS_REVISION' ? 'Отправьте исправленный ответ' : 'Ваш ответ'}
                        </div>
                        <Textarea
                          placeholder="Напишите ваш ответ здесь..."
                          value={submitContent}
                          onChange={e => setSubmitContent(e.target.value)}
                          className="rounded-2xl border-gray-200 bg-white min-h-[120px] p-4 font-medium text-[#0A0A0B] focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                            Прикрепить файлы (необязательно)
                          </label>
                          <input
                            type="file"
                            multiple
                            onChange={e => setSubmitFiles(e.target.files ? Array.from(e.target.files) : [])}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          />
                          {submitFiles.length > 0 && (
                            <div className="mt-2 text-[10px] font-black text-primary">{submitFiles.length} файл(ов) выбрано</div>
                          )}
                        </div>
                        <Button
                          onClick={handleSubmitHomework}
                          disabled={isSubmitting}
                          className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                        >
                          {isSubmitting ? 'Отправка...' : 'Отправить работу'}
                        </Button>
                      </div>
                    )}

                    {/* Already submitted & locked */}
                    {submission && submission.status === 'SUBMITTED' && (
                      <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Работа отправлена</div>
                        <p className="text-sm font-semibold text-blue-800">Дождитесь проверки от преподавателя</p>
                      </div>
                    )}

                    {submission && submission.status === 'APPROVED' && (
                      <div className="p-5 rounded-2xl border border-green-200 bg-green-50 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">Задание зачтено</div>
                        <p className="text-sm font-semibold text-green-800">Поздравляем! Ваша работа принята</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
