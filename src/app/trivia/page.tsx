'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';

interface TriviaAnswer {
    id?: string;
    text: string;
    correct: boolean;
}

interface TriviaQuestion {
    id?: string;
    question: string;
    answers: TriviaAnswer[];
    explanation: string | null;
}

interface TriviaLevel {
    siteId: string;
    siteName: string;
    difficulty: string;
    questions: TriviaQuestion[];
}

export default function TriviaPage() {
    const [triviaData, setTriviaData] = useState<TriviaLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [levelScores, setLevelScores] = useState<number[]>([]);

    // Fetch trivia data from database
    useEffect(() => {
        async function fetchTrivia() {
            try {
                setLoading(true);
                const response = await fetch('/api/trivia');
                if (!response.ok) throw new Error('Failed to fetch trivia questions');

                const result = await response.json();
                setTriviaData(result.data || []);
            } catch (err) {
                console.error('Error fetching trivia:', err);
                setError(err instanceof Error ? err.message : 'Failed to load trivia');
            } finally {
                setLoading(false);
            }
        }

        fetchTrivia();
    }, []);

    const currentLevelData = triviaData[currentLevel];
    const question = currentLevelData?.questions[currentQuestion];
    const totalQuestions = currentLevelData?.questions.length || 0;

    const startLevel = (levelIndex: number) => {
        setCurrentLevel(levelIndex);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setGameState('playing');
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (showExplanation) return;
        setSelectedAnswer(answerIndex);
        setShowExplanation(true);

        if (question?.answers[answerIndex]?.correct) {
            setScore(score + 10);
        }
    };

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            // Level completed
            const newLevelScores = [...levelScores];
            newLevelScores[currentLevel] = score;
            setLevelScores(newLevelScores);
            setGameState('result');
        }
    };

    const resetGame = () => {
        setGameState('menu');
        setScore(0);
        setCurrentLevel(0);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 pb-12 border-b border-heritage-light/30 md:pt-32 md:pb-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark md:mb-6">
                            Heritage Trivia
                        </h1>
                        <p className="text-lg leading-relaxed text-heritage-dark/70 md:text-xl">
                            Test your knowledge about cultural heritage and historical sites
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 py-12 md:px-6 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-primary mx-auto mb-4"></div>
                                    <p className="text-heritage-dark/70">Loading trivia questions...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center max-w-md">
                                    <svg className="w-12 h-12 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-heritage-dark/70 font-medium mb-2">Failed to load trivia</p>
                                    <p className="text-sm text-heritage-dark/60">{error}</p>
                                </div>
                            </div>
                        ) : triviaData.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center max-w-md">
                                    <svg className="w-12 h-12 text-heritage-dark/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-heritage-dark/70 font-medium mb-2">No trivia available yet</p>
                                    <p className="text-sm text-heritage-dark/60">Trivia questions will be added soon!</p>
                                </div>
                            </div>
                        ) : gameState === 'menu' && (
                            <div className="space-y-8">
                                {/* Score Display */}
                                {levelScores.length > 0 && (
                                    <div className="p-6 text-center border border-heritage-light/40 rounded-lg bg-gradient-to-br from-heritage-light/50 to-white">
                                        <h2 className="mb-2 text-xl font-semibold text-heritage-dark">Total Score</h2>
                                        <p className="text-4xl font-bold text-heritage-primary">
                                            {levelScores.reduce((a, b) => a + b, 0)} points
                                        </p>
                                    </div>
                                )}

                                {/* Level Selection */}
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-center font-serif text-heritage-dark">
                                        Choose a Heritage Site
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        {triviaData.map((level, index) => (
                                            <button
                                                key={level.siteId}
                                                onClick={() => startLevel(index)}
                                                className="p-6 text-left transition-all bg-white border-2 border-heritage-light/40 rounded-lg hover:border-heritage-primary hover:shadow-md"
                                            >
                                                <div className="mb-3 text-3xl">
                                                    {index === 0 ? '♜' : index === 1 ? '🕉️' : '🛕'}
                                                </div>
                                                <h3 className="mb-2 text-lg font-semibold text-heritage-dark">
                                                    {level.siteName}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-heritage-dark/70">
                                                        {level.questions.length} questions
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${level.difficulty === 'EASY'
                                                        ? 'bg-green-100 text-green-700'
                                                        : level.difficulty === 'MEDIUM'
                                                            ? 'bg-heritage-primary/30 text-heritage-secondary'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {level.difficulty}
                                                    </span>
                                                </div>
                                                {levelScores[index] !== undefined && (
                                                    <div className="pt-3 mt-3 border-t border-heritage-light/40">
                                                        <p className="text-sm font-medium text-heritage-primary">
                                                            Best: {levelScores[index]} points
                                                        </p>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameState === 'playing' && question && (
                            <div className="space-y-6">
                                {/* Progress */}
                                <div className="flex items-center justify-between p-4 border border-heritage-light/40 rounded-lg bg-heritage-light/20">
                                    <div>
                                        <p className="text-sm text-heritage-dark/70">Level: {currentLevelData.siteName}</p>
                                        <p className="text-xs text-heritage-dark/60">
                                            Question {currentQuestion + 1} of {totalQuestions}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-heritage-primary">{score}</p>
                                        <p className="text-xs text-heritage-dark/70">points</p>
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="p-6 border border-heritage-light/40 rounded-lg md:p-8 bg-white">
                                    <h3 className="mb-6 text-xl font-semibold md:text-2xl text-heritage-dark">
                                        {question.question}
                                    </h3>

                                    {/* Answers */}
                                    <div className="space-y-3">
                                        {question.answers.map((answer, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrect = answer.correct;
                                            const showResult = showExplanation;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(index)}
                                                    disabled={showExplanation}
                                                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${!showResult
                                                        ? 'border-heritage-light/40 hover:border-heritage-primary hover:bg-heritage-light/20'
                                                        : isSelected && isCorrect
                                                            ? 'border-green-500 bg-green-50'
                                                            : isSelected && !isCorrect
                                                                ? 'border-red-500 bg-red-50'
                                                                : isCorrect
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : 'border-heritage-light/40 opacity-50'
                                                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-heritage-dark">
                                                            {answer.text}
                                                        </span>
                                                        {showResult && isCorrect && (
                                                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                        {showResult && isSelected && !isCorrect && (
                                                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    {showExplanation && (
                                        <div className="p-4 mt-6 border-l-4 rounded bg-heritage-light/30 border-heritage-primary">
                                            <p className="mb-1 text-sm font-semibold text-heritage-dark">
                                                Explanation
                                            </p>
                                            <p className="text-sm text-heritage-dark/80">{question.explanation}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                {showExplanation && (
                                    <div className="flex justify-between">
                                        <Button variant="default" onClick={resetGame}>
                                            Exit Level
                                        </Button>
                                        <Button variant="primary" onClick={handleNext}>
                                            {currentQuestion < totalQuestions - 1 ? 'Next Question' : 'Finish Level'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {gameState === 'result' && (
                            <div className="space-y-6 text-center">
                                <div className="p-8 border border-heritage-light/40 rounded-lg md:p-12 bg-gradient-to-br from-heritage-light/50 to-white">
                                    <div className="mb-4 text-6xl">
                                        {score >= totalQuestions * 8 ? '🏆' : score >= totalQuestions * 5 ? '⭐' : '👍'}
                                    </div>
                                    <h2 className="mb-2 text-3xl font-bold font-serif text-heritage-dark">
                                        Level Complete!
                                    </h2>
                                    <p className="mb-6 text-heritage-dark/70">
                                        You completed {currentLevelData?.siteName}
                                    </p>
                                    <div className="p-6 mb-6 bg-white border border-heritage-light/40 rounded-lg">
                                        <p className="mb-2 text-sm text-heritage-dark/70">Your Score</p>
                                        <p className="text-5xl font-bold text-heritage-primary">{score}</p>
                                        <p className="mt-2 text-sm text-heritage-dark/70">
                                            out of {totalQuestions * 10} points
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                        <Button variant="default" onClick={resetGame}>
                                            Back to Menu
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setScore(0);
                                                startLevel(currentLevel);
                                            }}
                                        >
                                            Play Again
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
