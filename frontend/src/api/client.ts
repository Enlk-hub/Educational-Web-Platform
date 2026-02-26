import { Homework, Question, TestResult, User, VideoLesson, Subject, Submission, AdminStats, AdminNote, AuditLog } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN_KEY = 'entbridge_token';
const USER_KEY = 'entbridge_user';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

export const storeAuth = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const storeTokenOnly = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const buildHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(isFormData),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = 'Ошибка запроса';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (name: string, email: string, username: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: name, email, username, password }),
    }),
  getMe: () => request<User>('/profile/me'),
  updateProfile: (name: string, email: string) =>
    request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
  getProfileResults: (page: number, size: number) =>
    request<{ content: TestResult[]; totalElements: number }>(
      `/profile/results?page=${page}&size=${size}`
    ),
  getSubjects: () => request<Subject[]>('/subjects'),
  getQuestions: (subjectId: string) =>
    request<Question[]>(`/tests/questions?subjectId=${subjectId}`),
  submitTest: (subjectId: string, answers: { questionId: string; selectedOptionId?: string }[]) =>
    request<TestResult>('/tests/submit', {
      method: 'POST',
      body: JSON.stringify({ subjectId, answers }),
    }),
  getVideos: (subjectId?: string) =>
    request<VideoLesson[]>(subjectId ? `/videos?subjectId=${subjectId}` : '/videos'),
  getHomework: () => request<Homework[]>('/homework'),
  submitHomework: (homeworkId: string, content?: string, files?: File[]) => {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }
    return request<Submission>(`/homework/${homeworkId}/submit`, {
      method: 'POST',
      body: formData,
    });
  },
  admin: {
    getUsers: () => request<User[]>('/admin/users'),
    getResults: () => request<TestResult[]>('/admin/results'),
    getHomework: () => request<Homework[]>('/admin/homework'),
    createHomework: (payload: { title: string; description: string; subjectId: string; dueDate: string }) =>
      request<Homework>('/admin/homework', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateHomework: (homeworkId: string, payload: { title: string; description: string; subjectId: string; dueDate: string }) =>
      request<Homework>(`/admin/homework/${homeworkId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    deleteHomework: (homeworkId: string) =>
      request<{ message: string }>(`/admin/homework/${homeworkId}`, {
        method: 'DELETE',
      }),
    reviewSubmission: (submissionId: string, payload: { status: string; feedback?: string; grade?: number }) =>
      request<Submission>(`/admin/homework/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    uploadHomeworkAttachments: (homeworkId: string, files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      return request<Homework>(`/admin/homework/${homeworkId}/attachments`, {
        method: 'POST',
        body: formData,
      });
    },
    createSubject: (payload: { code: string; title: string; iconUrl?: string; isMandatory: boolean; category?: string; maxScore?: number }) =>
      request<Subject>('/admin/subjects', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    createQuestion: (payload: { subjectId: string; text: string; points?: number; explanation?: string; options: { text: string; isCorrect: boolean }[] }) =>
      request<{ id: string; message: string }>('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    importQuestions: (subjectId: string, file: File) => {
      const formData = new FormData();
      formData.append('subjectId', subjectId);
      formData.append('file', file);
      return request<{ created: number; skipped: number; errors: string[] }>('/admin/questions/import', {
        method: 'POST',
        body: formData,
      });
    },
    createVideo: (payload: { title: string; subjectId: string; youtubeUrl: string; description?: string; thumbnail?: string; duration?: string }) =>
      request<VideoLesson>('/admin/videos', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateVideo: (videoId: string, payload: { title?: string; subjectId?: string; youtubeUrl?: string; description?: string; thumbnail?: string; duration?: string }) =>
      request<VideoLesson>(`/admin/videos/${videoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    deleteVideo: (videoId: string) =>
      request<{ message: string }>(`/admin/videos/${videoId}`, {
        method: 'DELETE',
      }),
    getProfileStats: () => request<AdminStats>('/admin/profile/stats'),
    getNotes: () => request<AdminNote[]>('/admin/profile/notes'),
    createNote: (content: string) =>
      request<AdminNote>('/admin/profile/notes', {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    updateNote: (noteId: string, payload: { content?: string; completed?: boolean }) =>
      request<AdminNote>(`/admin/profile/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    deleteNote: (noteId: string) =>
      request<{ message: string }>(`/admin/profile/notes/${noteId}`, {
        method: 'DELETE',
      }),
    getActivity: () => request<AuditLog[]>('/admin/profile/activity'),
  },
};

export const resolveDownloadUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = API_BASE_URL.endsWith('/api/v1') && url.startsWith('/api/v1')
    ? API_BASE_URL.replace(/\/api\/v1$/, '')
    : API_BASE_URL;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

const filenameFromDisposition = (header: string | null) => {
  if (!header) return null;
  const match = header.match(/filename=\"?([^\";]+)\"?/i);
  return match ? match[1] : null;
};

export const downloadWithAuth = async (url: string, fallbackName?: string) => {
  const token = getStoredToken();
  const response = await fetch(resolveDownloadUrl(url), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error('Ошибка загрузки файла');
  }
  const blob = await response.blob();
  const filename = filenameFromDisposition(response.headers.get('content-disposition')) || fallbackName || 'download';
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
