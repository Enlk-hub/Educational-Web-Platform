import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, downloadWithAuth } from '../api/client';
import { Attachment, Homework, Subject, TestResult } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { User, Calendar, Mail, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RichTextEditor } from './RichTextEditor';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
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
  const [homeworkDrafts, setHomeworkDrafts] = useState<Record<string, string>>({});
  const [homeworkFiles, setHomeworkFiles] = useState<Record<string, File[]>>({});
  const [homeworkSubmittingId, setHomeworkSubmittingId] = useState<string | null>(null);
  const [homeworkLoading, setHomeworkLoading] = useState(true);
  const [homeworkError, setHomeworkError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setLoadError('');

    api.getProfileResults(0, 50)
      .then((data) => setResults(data.content))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setHomeworkLoading(true);
    setHomeworkError('');
    Promise.all([api.getHomework(), api.getSubjects()])
      .then(([homeworkData, subjectData]) => {
        setHomework(homeworkData);
        setSubjects(subjectData);
      })
      .catch((err) => setHomeworkError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setHomeworkLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  const handleSave = async () => {
    const updated = await updateProfile(formData);
    if (updated) {
      setIsEditing(false);
      toast('Профиль успешно обновлен');
    } else {
      toast('Не удалось обновить профиль');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      toast('Пожалуйста, заполните все поля');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast('Пароли не совпадают');
      return;
    }

    try {
      await api.changePassword(passwordForm.current, passwordForm.next);
      toast('Пароль успешно изменен');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка смены пароля');
    }
  };

  const totalTests = results.length;
  const averageScore = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / totalTests)
    : 0;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const subjectNameById = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const getSubmissionStatusLabel = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Принято';
      case 'NEEDS_REVISION':
        return 'Нужна доработка';
      case 'SUBMITTED':
        return 'Отправлено';
      default:
        return 'Не отправлено';
    }
  };
  const getSubmissionVariant = (status?: string) => {
    if (status === 'APPROVED') return 'default';
    if (status === 'NEEDS_REVISION') return 'destructive';
    if (status === 'SUBMITTED') return 'secondary';
    return 'outline';
  };

  const handleDownload = async (file: Attachment) => {
    try {
      await downloadWithAuth(file.downloadUrl, file.name);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">
            Управляйте своим профилем и отслеживайте прогресс
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Тестов пройдено</p>
                  <div className="text-2xl">{totalTests}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Средний балл</p>
                  <div className="text-2xl">{averageScore}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Всего баллов</p>
                  <div className="text-2xl">{totalScore}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="history">История тестов</TabsTrigger>
            <TabsTrigger value="homework">Домашние задания</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                  Обновите свои личные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-2" />
                    Полное имя
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Дата регистрации
                  </Label>
                  <Input
                    value={new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>Роль</Label>
                  <div>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Администратор' : 'Студент'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            email: user.email,
                          });
                        }}
                      >
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Редактировать профиль
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Смена пароля</CardTitle>
                <CardDescription>
                  Обновите свой пароль для безопасности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  />
                </div>

                <Button onClick={handleChangePassword}>
                  Изменить пароль
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Загрузка результатов...</p>
                </CardContent>
              </Card>
            ) : loadError ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">{loadError}</p>
                </CardContent>
              </Card>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    У вас пока нет результатов тестов
                  </p>
                </CardContent>
              </Card>
            ) : (
              results.map((result) => {
                const percentage = Math.round((result.score / result.maxScore) * 100);

                return (
                  <Card key={result.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{result.subjectName}</CardTitle>
                          <CardDescription>
                            {new Date(result.date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant={percentage >= 75 ? 'default' : 'secondary'}>
                          {result.score} / {result.maxScore}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Правильных ответов: {result.correctAnswers} из {result.totalQuestions}
                          </span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="homework" className="space-y-4">
            {homeworkLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Загрузка домашних заданий...</p>
                </CardContent>
              </Card>
            ) : homeworkError ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">{homeworkError}</p>
                </CardContent>
              </Card>
            ) : homework.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Домашние задания пока не назначены</p>
                </CardContent>
              </Card>
            ) : (
              homework.map((task) => {
                const submission = task.submissions[0];
                const draft = homeworkDrafts[task.id] ?? submission?.content ?? '';
                const status = submission?.status;
                const selectedFiles = homeworkFiles[task.id] || [];
                const hasText = draft.replace(/<[^>]*>/g, '').trim().length > 0;
                const hasExistingText = submission?.content
                  ? submission.content.replace(/<[^>]*>/g, '').trim().length > 0
                  : false;
                const hasExistingFiles = (submission?.attachments?.length || 0) > 0;
                const isLocked = submission && status !== 'NEEDS_REVISION';

                return (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <CardTitle>{task.title}</CardTitle>
                          <div
                            className="text-muted-foreground rich-text-content"
                            dangerouslySetInnerHTML={{ __html: task.description }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{subjectNameById(task.subjectId)}</Badge>
                          <Badge variant={getSubmissionVariant(status)}>
                            {getSubmissionStatusLabel(status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Срок сдачи: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                      </div>
                      {submission?.feedback && (
                        <div className="text-sm text-muted-foreground">
                          Комментарий: {submission.feedback}
                        </div>
                      )}
                      {task.attachments?.length > 0 && (
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">Файлы задания</div>
                          <div className="flex flex-col gap-1">
                            {task.attachments.map((file) => (
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
                      {submission?.attachments?.length > 0 && (
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">Ваши файлы</div>
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
                      <div className="space-y-2">
                        <Label htmlFor={`hw-${task.id}`}>Ответ студента</Label>
                        <RichTextEditor
                          value={draft}
                          onChange={(value) => setHomeworkDrafts((prev) => ({ ...prev, [task.id]: value }))}
                          placeholder="Введите ответ или ссылку на работу"
                          disabled={isLocked}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Файл ответа (если нужно)</Label>
                        <Input
                          type="file"
                          multiple
                          disabled={isLocked}
                          onChange={(event) =>
                            setHomeworkFiles((prev) => ({
                              ...prev,
                              [task.id]: Array.from(event.target.files || []),
                            }))
                          }
                        />
                        {selectedFiles.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Выбрано файлов: {selectedFiles.length}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={async () => {
                            if (!hasText && selectedFiles.length === 0 && !hasExistingText && !hasExistingFiles) {
                              toast('Добавьте текст или файл');
                              return;
                            }
                            setHomeworkSubmittingId(task.id);
                            try {
                              const updated = await api.submitHomework(task.id, draft, selectedFiles);
                              setHomework((prev) =>
                                prev.map((hw) =>
                                  hw.id === task.id ? { ...hw, submissions: [updated] } : hw
                                )
                              );
                              setHomeworkFiles((prev) => ({ ...prev, [task.id]: [] }));
                              toast('Ответ отправлен');
                            } catch (err) {
                              toast(err instanceof Error ? err.message : 'Ошибка отправки');
                            } finally {
                              setHomeworkSubmittingId(null);
                            }
                          }}
                          disabled={homeworkSubmittingId === task.id || isLocked}
                        >
                          {submission ? 'Обновить ответ' : 'Отправить ответ'}
                        </Button>
                        {isLocked && (
                          <span className="text-xs text-muted-foreground">
                            Ответ отправлен, ждите проверки
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
