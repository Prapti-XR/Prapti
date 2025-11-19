'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';

// Trivia data based on heritage sites
const triviaData = [
    {
        site: 'Sonda Fort',
        difficulty: 'EASY',
        questions: [
            {
                question: 'Which dynasty built Sonda Fort?',
                answers: [
                    { text: 'The Sonda Nayakas under the Vijayanagara Empire', correct: true },
                    { text: 'The Hoysala Dynasty', correct: false },
                    { text: 'The Kadamba Dynasty', correct: false },
                    { text: 'The British East India Company', correct: false },
                ],
                explanation: 'Sonda Fort was built by the Sonda Nayakas during the Vijayanagara Empire period around 1500 CE. The fort served as an important military outpost.',
            },
            {
                question: 'What era does Sonda Fort belong to?',
                answers: [
                    { text: 'Medieval', correct: true },
                    { text: 'Ancient', correct: false },
                    { text: 'Modern', correct: false },
                    { text: 'Colonial', correct: false },
                ],
                explanation: 'Sonda Fort belongs to the Medieval era, built around 1500 CE during the Vijayanagara period.',
            },
        ],
    },
    {
        site: 'Sahasralinga',
        difficulty: 'EASY',
        questions: [
            {
                question: 'The carvings at Sahasralinga are dedicated to which Hindu deity?',
                answers: [
                    { text: 'Lord Shiva', correct: true },
                    { text: 'Lord Vishnu', correct: false },
                    { text: 'Lord Ganesha', correct: false },
                    { text: 'Goddess Durga', correct: false },
                ],
                explanation: 'Sahasralinga features thousands of Shiva lingas carved on riverbed rocks, making it a sacred Shaivite pilgrimage site.',
            },
            {
                question: 'What makes Sahasralinga particularly spectacular during the monsoon season?',
                answers: [
                    { text: 'The river water flows over the thousand carved lingas', correct: true },
                    { text: 'The carvings glow in the moonlight', correct: false },
                    { text: 'New lingas appear from underground', correct: false },
                    { text: 'The rocks change color', correct: false },
                ],
                explanation: 'During monsoons, the Shalmala river swells and flows over the rock carvings, creating a beautiful and spiritually significant sight.',
            },
        ],
    },
    {
        site: 'Somasagara Temple',
        difficulty: 'MEDIUM',
        questions: [
            {
                question: 'Which architectural style influenced the Somasagara Shiva Temple?',
                answers: [
                    { text: 'Hoysala-influenced architecture', correct: true },
                    { text: 'Mughal architecture', correct: false },
                    { text: 'Gothic architecture', correct: false },
                    { text: 'Modern minimalist design', correct: false },
                ],
                explanation: 'Despite predating the Hoysala period, the temple shows architectural elements that would later be refined by Hoysala craftsmen.',
            },
        ],
    },
];

export default function TriviaPage() {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [levelScores, setLevelScores] = useState<number[]>([]);

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

        if (question.answers[answerIndex].correct) {
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
                <header className="pt-24 pb-12 border-b border-gray-100 md:pt-32 md:pb-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark md:mb-6">
                            Heritage Trivia
                        </h1>
                        <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                            Test your knowledge about cultural heritage and historical sites
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 py-12 md:px-6 md:py-16">
                    <div className="max-w-4xl mx-auto">{gameState === 'menu' && (
                        <div className="space-y-8">
                            {/* Score Display */}
                            {levelScores.length > 0 && (
                                <div className="p-6 text-center border border-gray-200 rounded-lg bg-gradient-to-br from-heritage-light to-gray-50">
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
                                            key={index}
                                            onClick={() => startLevel(index)}
                                            className="p-6 text-left transition-all bg-white border-2 border-gray-200 rounded-lg hover:border-heritage-primary hover:shadow-md"
                                        >
                                            <div className="mb-3 text-3xl">
                                                {index === 0 ? '♜' : index === 1 ? '🕉️' : '🛕'}
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-heritage-dark">
                                                {level.site}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    {level.questions.length} questions
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${level.difficulty === 'EASY'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {level.difficulty}
                                                </span>
                                            </div>
                                            {levelScores[index] !== undefined && (
                                                <div className="pt-3 mt-3 border-t border-gray-200">
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
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div>
                                        <p className="text-sm text-gray-600">Level: {currentLevelData.site}</p>
                                        <p className="text-xs text-gray-500">
                                            Question {currentQuestion + 1} of {totalQuestions}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-heritage-primary">{score}</p>
                                        <p className="text-xs text-gray-600">points</p>
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="p-6 border border-gray-200 rounded-lg md:p-8 bg-white">
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
                                                            ? 'border-gray-200 hover:border-heritage-primary hover:bg-heritage-light/20'
                                                            : isSelected && isCorrect
                                                                ? 'border-green-500 bg-green-50'
                                                                : isSelected && !isCorrect
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : isCorrect
                                                                        ? 'border-green-500 bg-green-50'
                                                                        : 'border-gray-200 opacity-50'
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
                                        <div className="p-4 mt-6 border-l-4 rounded bg-blue-50 border-heritage-primary">
                                            <p className="mb-1 text-sm font-semibold text-heritage-dark">
                                                Explanation
                                            </p>
                                            <p className="text-sm text-gray-700">{question.explanation}</p>
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
                                <div className="p-8 border border-gray-200 rounded-lg md:p-12 bg-gradient-to-br from-heritage-light to-gray-50">
                                    <div className="mb-4 text-6xl">
                                        {score >= totalQuestions * 8 ? '🏆' : score >= totalQuestions * 5 ? '⭐' : '👍'}
                                    </div>
                                    <h2 className="mb-2 text-3xl font-bold font-serif text-heritage-dark">
                                        Level Complete!
                                    </h2>
                                    <p className="mb-6 text-gray-600">
                                        You completed {currentLevelData.site}
                                    </p>
                                    <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg">
                                        <p className="mb-2 text-sm text-gray-600">Your Score</p>
                                        <p className="text-5xl font-bold text-heritage-primary">{score}</p>
                                        <p className="mt-2 text-sm text-gray-600">
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
