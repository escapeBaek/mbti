
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { cn } from "@/lib/utils";
import { type Language, getTranslations, getResponseOptions } from '@/lib/i18n';
import { analyzePersonality } from '@/ai/flows/analyze-personality';

function PersonalityTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [lang, setLang] = useState<Language>('ko');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [questions, setQuestions] = useState<{ id: number; text: string; }[]>([]);

  useEffect(() => {
    const langParam = searchParams.get('lang') as Language | null;
    if (langParam) {
      setLang(langParam);
    }
  }, [searchParams]);

  const t = useMemo(() => getTranslations(lang), [lang]);
  const responseOptions = useMemo(() => getResponseOptions(t), [t]);

  useEffect(() => {
    if (t.questions) {
      const questionKeys = Object.keys(t.questions);
      const formattedQuestions = questionKeys.map(key => ({
        id: parseInt(key, 10),
        text: t.questions[key],
      }));
      setQuestions(formattedQuestions);
    }
  }, [t]);

  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: number) => {
    if (isAnimating || questions.length === 0) return;

    setIsAnimating(true);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnimating(false);
      }
    }, 300);
  };
  
  useEffect(() => {
    const submitAnswers = async () => {
      if (questions.length > 0 && answers.length === questions.length) {
        setIsLoading(true);
        setError(null);
        try {
          const result = await analyzePersonality({ responses: answers, language: lang });
          const params = new URLSearchParams({
            lang,
            type: result.personalityType,
            desc: result.description,
            strengths: JSON.stringify(result.strengths),
            weaknesses: JSON.stringify(result.weaknesses),
            careerPaths: JSON.stringify(result.careerPaths),
            relationships: result.relationships,
          });
          router.push(`/results?${params.toString()}`);
        } catch (e) {
          console.error(e);
          setError(t.analysisError);
          setIsLoading(false);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: t.analysisError,
          });
        }
      }
    };
    submitAnswers();
  }, [answers, lang, router, t, toast, questions.length]);

  const getOptionStyle = (value: number) => {
    switch (value) {
      case 1: return 'w-10 h-10 sm:w-12 sm:h-12 bg-destructive hover:bg-destructive/90';
      case 2: return 'w-8 h-8 sm:w-10 sm:h-10 bg-destructive/75 hover:bg-destructive/65';
      case 3: return 'w-7 h-7 sm:w-8 sm:h-8 bg-destructive/50 hover:bg-destructive/40';
      case 4: return 'w-6 h-6 sm:w-7 sm:h-7 bg-muted hover:bg-muted-foreground/20';
      case 5: return 'w-7 h-7 sm:w-8 sm:h-8 bg-primary/50 hover:bg-primary/40';
      case 6: return 'w-8 h-8 sm:w-10 sm:h-10 bg-primary/75 hover:bg-primary/65';
      case 7: return 'w-10 h-10 sm:w-12 sm:h-12 bg-primary hover:bg-primary/90';
      default: return 'h-8 w-8';
    }
  };

  if (isLoading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">{t.loadingAnalysis}</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => router.push(`/?lang=${lang}`)} className="mt-4">
            {t.takeAgain}
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 relative">
       <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8">
        <Button asChild variant="outline" size="icon">
          <Link href={`/?lang=${lang}`}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <p className="text-sm font-medium text-primary mb-1 text-center">
            {t.question} {currentQuestionIndex + 1} {t.of} {questions.length}
          </p>
          <Progress value={progress} className="h-2" />
        </div>
        
        <Card key={currentQuestionIndex} className={`shadow-xl transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center leading-tight">
              {currentQuestion?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
                <span className="w-16 shrink-0 text-right font-medium text-destructive sm:w-20">{t.disagree}</span>
                <div className="flex flex-grow items-center justify-center gap-1.5 sm:gap-2">
                    {responseOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => handleAnswer(value)}
                        aria-label={label}
                        className={cn(
                        "group relative flex cursor-pointer items-center justify-center rounded-full border-transparent transition-all duration-200 hover:scale-110",
                        getOptionStyle(value)
                        )}
                    >
                        <span className="absolute top-full mt-2 hidden w-max rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                        {label}
                        </span>
                    </button>
                    ))}
                </div>
                <span className="w-16 shrink-0 text-left font-medium text-primary sm:w-20">{t.agree}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoaderCircle className="w-12 h-12 animate-spin text-primary"/></div>}>
      <PersonalityTest />
    </Suspense>
  )
}
