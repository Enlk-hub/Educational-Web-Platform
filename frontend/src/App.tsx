import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
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
import { NotFoundPage } from './components/NotFoundPage';
import { Subject, TestResult } from './types';
import { Toaster } from './components/ui/sonner';
import './styles/globals.css';

type Page = 'home' | 'login' | 'subjects' | 'test' | 'results' | 'profile' | 'videos' | 'about' | 'admin';

export default function App() {
  const { loginWithToken } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Handle OAuth2 redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      if (token) {
        loginWithToken(token).then((success) => {
          if (success) {
            // Remove query params
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to subjects page
            setCurrentPage('subjects');
          }
        });
      }
    }

    if (error) {
      console.error("OAuth2 Error:", error);
      // Could show a toast here
    }
  }, []);

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
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main>{renderPage()}</main>
      <Toaster />
    </div>
  );
}
