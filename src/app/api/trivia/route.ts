import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';

/**
 * GET /api/trivia
 * Fetch trivia questions grouped by heritage sites
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const difficulty = searchParams.get('difficulty');

    // If siteId is provided, get questions for that specific site
    if (siteId) {
      const site = await prisma.heritageSite.findUnique({
        where: { id: siteId },
        include: {
          triviaQuestions: {
            where: difficulty ? { difficulty: difficulty as any } : {},
            include: {
              answers: {
                select: {
                  id: true,
                  answerText: true,
                  isCorrect: true,
                  explanation: true,
                },
              },
            },
          },
        },
      });

      if (!site) {
        return NextResponse.json(
          { success: false, error: 'Heritage site not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: serializeBigInt({
          site: {
            id: site.id,
            name: site.name,
          },
          questions: site.triviaQuestions.map((q: any) => ({
            id: q.id,
            question: q.question,
            explanation: q.explanation,
            answers: q.answers.map((a: any) => ({
              id: a.id,
              text: a.answerText,
              correct: a.isCorrect,
            })),
          })),
        }),
      });
    }

    // Otherwise, get all sites with their trivia questions
    const sites = await prisma.heritageSite.findMany({
      where: {
        isPublished: true,
        triviaQuestions: {
          some: {},
        },
      },
      include: {
        triviaQuestions: {
          where: difficulty ? { difficulty: difficulty as any } : {},
          include: {
            answers: {
              select: {
                id: true,
                answerText: true,
                isCorrect: true,
                explanation: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group by site and format for trivia game
    const triviaData = sites
      .filter((site) => site.triviaQuestions.length > 0)
      .map((site) => ({
        siteId: site.id,
        siteName: site.name,
        difficulty: site.triviaQuestions[0]?.difficulty || 'EASY',
        questions: site.triviaQuestions.map((q: any) => ({
          id: q.id,
          question: q.question,
          explanation: q.explanation,
          answers: q.answers.map((a: any) => ({
            id: a.id,
            text: a.answerText,
            correct: a.isCorrect,
          })),
        })),
      }));

    return NextResponse.json({
      success: true,
      data: serializeBigInt(triviaData),
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trivia questions' },
      { status: 500 }
    );
  }
}
