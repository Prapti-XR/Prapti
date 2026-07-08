import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TriviaAnswerInput {
    answerText: string;
    isCorrect: boolean;
    explanation?: string;
}

/**
 * POST /api/admin/trivia
 * Create a trivia question (with answers) for a heritage site.
 * ADMIN / MODERATOR only.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();
        const { siteId, question, difficulty, category, answers } = data;

        if (!siteId || !question || !difficulty || !category) {
            return NextResponse.json(
                { error: 'Missing required fields: siteId, question, difficulty, category' },
                { status: 400 }
            );
        }

        if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        if (!Array.isArray(answers) || answers.length < 2) {
            return NextResponse.json({ error: 'At least 2 answers required' }, { status: 400 });
        }

        const validAnswers: TriviaAnswerInput[] = answers.filter(
            (a: TriviaAnswerInput) => typeof a?.answerText === 'string' && a.answerText.trim().length > 0
        );

        if (validAnswers.length < 2 || !validAnswers.some((a) => a.isCorrect === true)) {
            return NextResponse.json(
                { error: 'Answers need at least 2 options and exactly one marked correct' },
                { status: 400 }
            );
        }

        const site = await prisma.heritageSite.findUnique({ where: { id: siteId }, select: { id: true } });
        if (!site) {
            return NextResponse.json({ error: 'Heritage site not found' }, { status: 404 });
        }

        const created = await prisma.triviaQuestion.create({
            data: {
                question,
                difficulty,
                category,
                siteId,
                answers: {
                    create: validAnswers.map((a) => ({
                        answerText: a.answerText.trim(),
                        isCorrect: Boolean(a.isCorrect),
                        explanation: a.explanation?.trim() || null,
                    })),
                },
            },
            include: { answers: true },
        });

        return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error) {
        console.error('Failed to create trivia question:', error);
        return NextResponse.json({ error: 'Failed to create trivia question' }, { status: 500 });
    }
}
