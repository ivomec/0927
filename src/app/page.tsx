rㅣ서 // Deployment test

'use client';

import * as React from 'react';
import PatientListPage from './components/PatientListPage';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === '0075') {
      setIsAuthenticated(true);
      toast({ title: '로그인 성공', description: '환자 목록 페이지로 이동합니다.' });
    } else {
      toast({ title: '로그인 실패', description: '비밀번호가 올바르지 않습니다.', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    toast({ title: '로그아웃', description: '로그인 페이지로 돌아갑니다.' });
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-sm mx-4">
          <CardHeader>
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>비밀번호를 입력하여 시스템에 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleLogin} className="w-full">
                로그인
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header isLoggedIn={true} onLogout={handleLogout} />
      <div className="container mx-auto p-4 md:p-6 bg-background">
        <PatientListPage />
      </div>
    </>
  );
}
