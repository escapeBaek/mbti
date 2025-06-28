"use client";

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Award, BarChart, Brain, Users, Briefcase, Sparkles, ShieldAlert, HeartHandshake, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type Language, getTranslations } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const personalityIcons: { [key: string]: React.ElementType } = {
  "Analysts": Brain,
  "Diplomats": Users,
  "Sentinels": Briefcase,
  "Explorers": BarChart,
  "Default": Award,
};

const personalityGroups: { [key: string]: string } = {
  'INTJ': 'Analysts', 'INTP': 'Analysts', 'ENTJ': 'Analysts', 'ENTP': 'Analysts',
  'INFJ': 'Diplomats', 'INFP': 'Diplomats', 'ENFJ': 'Diplomats', 'ENFP': 'Diplomats',
  'ISTJ': 'Sentinels', 'ISFJ': 'Sentinels', 'ESTJ': 'Sentinels', 'ESFJ': 'Sentinels',
  'ISTP': 'Explorers', 'ISFP': 'Explorers', 'ESTP': 'Explorers', 'ESFP': 'Explorers',
};

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const lang = (searchParams.get('lang') as Language) || 'ko';
  const personalityType = searchParams.get('type');
  const description = searchParams.get('desc');
  const strengthsParam = searchParams.get('strengths');
  const weaknessesParam = searchParams.get('weaknesses');
  const careerPathsParam = searchParams.get('careerPaths');
  const relationships = searchParams.get('relationships');

  const t = useMemo(() => getTranslations(lang), [lang]);
  
  const strengths = useMemo(() => strengthsParam ? JSON.parse(strengthsParam) : null, [strengthsParam]);
  const weaknesses = useMemo(() => weaknessesParam ? JSON.parse(weaknessesParam) : null, [weaknessesParam]);
  const careerPaths = useMemo(() => careerPathsParam ? JSON.parse(careerPathsParam) : null, [careerPathsParam]);

  const handleShare = async () => {
    if (!personalityType || !description) return;

    const shareData = {
      title: `${t.shareTitle}: ${personalityType}`,
      text: description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          description: t.linkCopied,
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: `${t.linkCopyError} ${err}`,
      });
    }
  };


  if (!personalityType || !description || !strengths || !weaknesses || !careerPaths || !relationships) {
    return <ResultsSkeleton t={t} />;
  }
  
  const group = personalityGroups[personalityType] || "Default";
  const Icon = personalityIcons[group] || personalityIcons["Default"];

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-2xl animate-fade-in">
        <CardHeader className="text-center items-center">
          <div className="bg-accent/20 p-4 rounded-full w-fit mb-4">
             <Icon className="h-12 w-12 text-accent-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t.resultTitle}</p>
          <CardTitle className="text-5xl font-bold text-primary tracking-wider">
            {personalityType}
          </CardTitle>
          <Badge variant="secondary" className="mt-2">{group}</Badge>
        </CardHeader>
        <CardContent className="px-6 md:px-8">
            <Separator className="my-4" />
            <p className="text-center text-lg text-foreground/80">
                {description}
            </p>
            <Separator className="my-4" />
            <div className="text-left">
                <h3 className="text-xl font-semibold mb-2 text-center">{t.detailedInsights}</h3>
                <Accordion type="single" collapsible className="w-full" defaultValue="strengths">
                    <AccordionItem value="strengths">
                        <AccordionTrigger className="text-lg hover:no-underline">
                            <div className="flex items-center">
                                <Sparkles className="h-5 w-5 mr-3 text-yellow-500" /> {t.strengths}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                                {strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="weaknesses">
                        <AccordionTrigger className="text-lg hover:no-underline">
                           <div className="flex items-center">
                                <ShieldAlert className="h-5 w-5 mr-3 text-red-500" /> {t.weaknesses}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                                {weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="relationships">
                        <AccordionTrigger className="text-lg hover:no-underline">
                            <div className="flex items-center">
                                <HeartHandshake className="h-5 w-5 mr-3 text-pink-500" /> {t.relationships}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/90 leading-relaxed">
                            {relationships}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="careerPaths">
                        <AccordionTrigger className="text-lg hover:no-underline">
                           <div className="flex items-center">
                                <Briefcase className="h-5 w-5 mr-3 text-blue-500" /> {t.careerPaths}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                                {careerPaths.map((c: string, i: number) => <li key={i}>{c}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2 w-full">
            <Button onClick={handleShare} size="lg" variant="outline" className="w-full text-lg">
                <Share2 className="h-5 w-5" />
                {t.shareResults}
            </Button>
            <Button asChild size="lg" className="w-full text-lg">
                <Link href={`/?lang=${lang}`}>{t.takeAgain}</Link>
            </Button>
        </CardFooter>
        <style jsx>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
      </Card>
    </main>
  );
}

function ResultsSkeleton({ t }: {t: any}) {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="text-center items-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-14 w-32 mb-2" />
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="px-6 md:px-8">
                    <Separator className="my-4" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <Separator className="my-4" />
                     <div className="text-left">
                        <Skeleton className="h-8 w-48 mb-4 mx-auto" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2 w-full">
                     <Button size="lg" className="w-full text-lg" disabled>
                        {t.shareResults}
                    </Button>
                    <Button size="lg" className="w-full text-lg" disabled>
                        {t.takeAgain}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}


export default function ResultsPage() {
    return (
        <Suspense fallback={<ResultsSkeleton t={getTranslations('ko')} />}>
            <ResultsDisplay />
        </Suspense>
    )
}
