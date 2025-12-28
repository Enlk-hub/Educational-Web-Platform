import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { SubjectSelectionPage } from './components/SubjectSelectionPage';
import { TestPage } from './components/TestPage';
import { ResultsPage } from './components/ResultsPage';
import { ProfilePage } from './components/ProfilePage';
import { VideosPage } from './components/VideosPage';
import { AboutPage } from './components/AboutPage';
import { AdminPage } from './components/AdminPage';
import { Subject, TestResult } from './types';
import { Toaster } from './components/ui/sonner';
import './styles/globals.css';

type Page = 'home' | 'login' | 'subjects' | 'test' | 'results' | 'profile' | 'videos' | 'about' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const handleStartTest = (subjects: Subject[]) => {
    setSelectedSubjects(subjects);
    setCurrentPage('test');
  };

  const handleCompleteTest = (results: TestResult[]) => {
    setTestResults(results);
    setCurrentPage('results');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'subjects':
        return <SubjectSelectionPage onStartTest={handleStartTest} />;
      case 'test':
        return <TestPage subjects={selectedSubjects} onComplete={handleCompleteTest} />;
      case 'results':
        return <ResultsPage results={testResults} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage />;
      case 'videos':
        return <VideosPage />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <main>{renderPage()}</main>
        <Toaster />
      </div>
    </AuthProvider>
  );
}
