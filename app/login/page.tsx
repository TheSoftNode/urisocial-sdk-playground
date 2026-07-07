'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="docerityLoginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f93a87" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#docerityLoginGradient)" strokeWidth="5"/>
                <path
                  d="M 30 20 L 30 80 L 58 80 C 73 80 82 71 82 50 C 82 29 73 20 58 20 Z M 38 28 L 58 28 C 68 28 74 34 74 50 C 74 66 68 72 58 72 L 38 72 Z"
                  fill="url(#docerityLoginGradient)"
                />
                <circle cx="60" cy="50" r="6" fill="#22c55e"/>
              </svg>
            </div>
          </div>
          <CardTitle>{mode === 'login' ? 'Welcome back' : 'Create account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in to access your dashboard'
              : 'Get started with your social media management'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setMode('login')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
