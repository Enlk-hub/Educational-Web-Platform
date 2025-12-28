import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../api/client';
import { Subject } from '../types';
import { CheckCircle2, Circle, Beaker, Globe, Palette } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2">Выбор предметов для тестирования</h1>
          <p className="text-muted-foreground">
            Выберите 2 профильных предмета в дополнение к обязательным предметам
          </p>
        </div>

        {loadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Загрузка предметов...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-2">Выбрано предметов</p>
                    <div className="text-3xl">
                      {mandatorySubjects.length + selectedElectives.length} / 5
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Максимальный балл</p>
                    <div className="text-3xl">{totalScore} / 140</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mandatory Subjects */}
            <div className="mb-8">
              <h2 className="mb-4">Обязательные предметы</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {mandatorySubjects.map(subject => (
                  <Card key={subject.id} className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <Badge variant="secondary">{subject.maxScore} баллов</Badge>
                      </div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>Обязательный предмет</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Elective Subjects */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2>Профильные предметы</h2>
                <Badge variant="outline">
                  Выбрано: {selectedElectives.length} / 2
                </Badge>
              </div>

              {/* Natural Sciences */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-blue-600" />
                  Естественно-научное направление
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {naturalSciences.map(subject => {
                    const isSelected = selectedElectives.includes(subject.id);
                    const isDisabled = !isSelected && selectedElectives.length >= 2;

                    return (
                      <Card
                        key={subject.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-blue-500 bg-blue-50'
                            : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-blue-300'
                        }`}
                        onClick={() => !isDisabled && toggleElective(subject.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <Badge variant="secondary">{subject.maxScore} баллов</Badge>
                          </div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Social Sciences */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Общественно-гуманитарное направление
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {socialSciences.map(subject => {
                    const isSelected = selectedElectives.includes(subject.id);
                    const isDisabled = !isSelected && selectedElectives.length >= 2;

                    return (
                      <Card
                        key={subject.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-green-500 bg-green-50'
                            : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-green-300'
                        }`}
                        onClick={() => !isDisabled && toggleElective(subject.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <Badge variant="secondary">{subject.maxScore} баллов</Badge>
                          </div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Creative */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Творческое направление
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {creative.map(subject => {
                    const isSelected = selectedElectives.includes(subject.id);
                    const isDisabled = !isSelected && selectedElectives.length >= 2;

                    return (
                      <Card
                        key={subject.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-purple-500 bg-purple-50'
                            : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-purple-300'
                        }`}
                        onClick={() => !isDisabled && toggleElective(subject.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <Badge variant="secondary">{subject.maxScore} баллов</Badge>
                          </div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleStartTest}
                disabled={selectedElectives.length !== 2}
              >
                Начать тестирование
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
