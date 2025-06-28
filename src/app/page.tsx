"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/language-selector';
import { type Language, getTranslations } from '@/lib/i18n';

export default function Home() {
  const [language, setLanguage] = useState<Language>('ko');
  const t = useMemo(() => getTranslations(language), [language]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-grid-slate-100 dark:bg-grid-slate-800 p-4">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
      </div>

      <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <BrainCircuit className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{t.welcomeTitle}</CardTitle>
          <CardDescription className="text-lg pt-2">{t.welcomeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <style jsx global>{`
            .bg-grid-slate-100 {
              background-image: linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(180deg, hsl(var(--border)) 1px, transparent 1px);
              background-size: 2rem 2rem;
            }
            .dark .bg-grid-slate-800 {
                background-image: linear-gradient(90deg, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(180deg, hsl(var(--border)/0.5) 1px, transparent 1px);
                background-size: 2rem 2rem;
            }
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.5s ease-out forwards;
            }
          `}</style>
        </CardContent>
        <CardFooter>
          <Button asChild size="lg" className="w-full text-lg">
            <Link href={`/test?lang=${language}`}>{t.startTest}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
