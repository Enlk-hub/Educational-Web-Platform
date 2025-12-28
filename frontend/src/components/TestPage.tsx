import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Question, Subject, TestResult } from '../types';
import { Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

interface TestPageProps {
  subjects: Subject[];
  onComplete: (results: TestResult[]) => void;
}

export const TestPage: React.FC<TestPageProps> = ({ subjects, onComplete }) => {
  const { user } = useAuth();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
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

    if (subjects.length > 0) {
      loadQuestions();
    } else {
      setIsLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [subjects]);

  // Timer
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
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
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
          if (subjectQs.length === 0) {
            throw new Error('Вопросы для выбранного предмета не найдены');
          }

          const payloadAnswers = subjectQs.map((question) => ({
            questionId: question.id,
            selectedOptionId: answers[question.id],
          }));

          const result = await api.submitTest(subject.id, payloadAnswers);

          return {
            ...result,
            userId: result.userId || user?.id || '1',
            answers: [],
          } as TestResult;
        })
      );

      onComplete(results);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки теста');
      setIsCompleted(false);
    }
  };

  const totalQuestions = subjects.reduce((sum, subject) => {
    return sum + (questionsBySubject[subject.id]?.length || 0);
  }, 0);

  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const canGoBack = currentSubjectIndex > 0 || currentQuestionIndex > 0;
  const isLastQuestion = currentSubjectIndex === subjects.length - 1 &&
                        currentQuestionIndex === subjectQuestions.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Загрузка вопросов...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">{loadError || 'Вопросы не найдены'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {submitError && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6 text-center text-red-600">
              {submitError}
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-muted-foreground">Предмет</p>
                  <Badge>{currentSubject.name}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Прогресс</p>
                <p>{answeredQuestions} / {totalQuestions} вопросов</p>
              </div>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Вопрос {currentQuestionIndex + 1} из {subjectQuestions.length}
              </CardTitle>
              <Badge variant={answers[currentQuestion.id] !== undefined ? 'default' : 'outline'}>
                {answers[currentQuestion.id] !== undefined ? 'Отвечен' : 'Не отвечен'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{currentQuestion.question}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-blue-300 bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-border'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoBack}
          >
            Назад
          </Button>

          <div className="text-muted-foreground">
            Предмет {currentSubjectIndex + 1} из {subjects.length}
          </div>

          {isLastQuestion ? (
            <Button onClick={handleFinishTest}>
              Завершить тест
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Далее
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
