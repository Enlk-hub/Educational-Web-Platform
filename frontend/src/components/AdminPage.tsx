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
import { api } from '../api/client';
import { Homework, Subject, TestResult, User } from '../types';
import { FileText, Users, BarChart, Plus, Calendar, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [isEditingHomework, setIsEditingHomework] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [reviewHomeworkId, setReviewHomeworkId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user?.isAdmin) return;
    setIsLoading(true);
    setLoadError('');

    Promise.all([
      api.getSubjects(),
      api.admin.getUsers(),
      api.admin.getResults(),
      api.admin.getHomework(),
    ])
      .then(([subjectData, userData, resultData, homeworkData]) => {
        setSubjects(subjectData);
        setUsers(userData);
        setResults(resultData);
        setHomework(homeworkData);
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

  const handleAddHomework = async () => {
    if (!newHomework.title || !newHomework.description || !newHomework.subjectId || !newHomework.dueDate) {
      toast('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const created = await api.admin.createHomework(newHomework);
      setHomework((prev) => [created, ...prev]);
      toast('Домашнее задание успешно добавлено');
      setIsAddingHomework(false);
      setNewHomework({
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
      });
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
    setIsEditingHomework(true);
  };

  const handleUpdateHomework = async () => {
    if (!editingHomework) return;
    if (!editHomework.title || !editHomework.description || !editHomework.subjectId || !editHomework.dueDate) {
      toast('Пожалуйста, заполните все поля');
      return;
    }
    try {
      const updated = await api.admin.updateHomework(editingHomework.id, editHomework);
      setHomework((prev) => prev.map((hw) => (hw.id === updated.id ? updated : hw)));
      toast('Задание обновлено');
      setIsEditingHomework(false);
      setEditingHomework(null);
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">
            Управление платформой, студентами и заданиями
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Студентов</p>
                  <div className="text-2xl">{totalStudents}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Пройдено тестов</p>
                  <div className="text-2xl">{totalTests}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Заданий</p>
                  <div className="text-2xl">{totalHomework}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground">Активных предметов</p>
                  <div className="text-2xl">{subjects.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="homework" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="homework">Домашние задания</TabsTrigger>
            <TabsTrigger value="students">Студенты</TabsTrigger>
            <TabsTrigger value="results">Результаты тестов</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="homework" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Управление домашними заданиями</CardTitle>
                    <CardDescription>
                      Создавайте и управляйте домашними заданиями для студентов
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingHomework} onOpenChange={setIsAddingHomework}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить задание
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новое домашнее задание</DialogTitle>
                        <DialogDescription>
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
                          <Textarea
                            id="description"
                            value={newHomework.description}
                            onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                            placeholder="Подробное описание задания..."
                            rows={4}
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
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="space-y-4">
                    {homework.map(hw => {
                      const subject = subjects.find(s => s.id === hw.subjectId);

                      return (
                        <Card key={hw.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle>{hw.title}</CardTitle>
                                <CardDescription>{hw.description}</CardDescription>
                              </div>
                              <Badge>{subject?.name}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
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
                                                Ответ: {submission.content}
                                              </div>
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
                    <Textarea
                      id="edit-description"
                      value={editHomework.description}
                      onChange={(e) => setEditHomework({ ...editHomework, description: e.target.value })}
                      rows={4}
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

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Список студентов</CardTitle>
                <CardDescription>
                  Все зарегистрированные студенты на платформе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Имя пользователя</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => !u.isAdmin).map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>
                          {new Date(student.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Просмотр
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Результаты тестов</CardTitle>
                <CardDescription>
                  Результаты всех пройденных тестов
                </CardDescription>
              </CardHeader>
              <CardContent>
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
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Новый предмет</CardTitle>
                  <CardDescription>
                    Создайте предмет, чтобы он появился в списках фронтенда
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

              <Card>
                <CardHeader>
                  <CardTitle>Новый вопрос</CardTitle>
                  <CardDescription>
                    Варианты ответов вводите построчно, правильный отметьте символом *
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
