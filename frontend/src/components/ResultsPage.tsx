import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TestResult } from '../types';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home } from 'lucide-react';

interface ResultsPageProps {
  results: TestResult[];
  onNavigate: (page: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ results, onNavigate }) => {
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxTotalScore = results.reduce((sum, r) => sum + r.maxScore, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { text: 'Отлично', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { text: 'Хорошо', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { text: 'Удовлетворительно', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Нужно улучшить', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const grade = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="mb-2">Тестирование завершено!</h1>
          <p className="text-muted-foreground">
            Вот результаты вашего тестирования
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2 border-blue-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{totalScore}</div>
              <p className="text-muted-foreground">из {maxTotalScore} баллов</p>
              <div className={`inline-block px-4 py-2 rounded-full mt-4 ${grade.bg}`}>
                <span className={grade.color}>{grade.text}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-muted-foreground mb-1">Процент правильных</p>
                <div className="text-2xl">{percentage}%</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-muted-foreground mb-1">Правильных ответов</p>
                <div className="text-2xl">{totalCorrect} / {totalQuestions}</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-muted-foreground mb-1">Предметов</p>
                <div className="text-2xl">{results.length}</div>
              </div>
            </div>

            <Progress value={percentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Subject Results */}
        <div className="mb-8">
          <h2 className="mb-4">Результаты по предметам</h2>
          <div className="space-y-4">
            {results.map((result) => {
              const subjectPercentage = Math.round((result.score / result.maxScore) * 100);
              
              return (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{result.subjectName}</CardTitle>
                      <Badge variant={subjectPercentage >= 75 ? 'default' : 'secondary'}>
                        {result.score} / {result.maxScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">
                            {result.correctAnswers} правильно
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">
                            {result.totalQuestions - result.correctAnswers} неправильно
                          </span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">
                        {subjectPercentage}%
                      </span>
                    </div>
                    <Progress value={subjectPercentage} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle>Рекомендации</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {percentage < 75 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Рекомендуем просмотреть видеоуроки по предметам с низкими баллами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Практикуйтесь регулярно, решая тесты каждый день</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Проанализируйте свои ошибки и повторите темы</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Следите за своим прогрессом в личном кабинете</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => onNavigate('subjects')}
          >
            Пройти еще раз
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate('profile')}
          >
            Посмотреть профиль
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate('home')}
          >
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};
