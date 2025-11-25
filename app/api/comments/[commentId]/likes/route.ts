import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/comments/[commentId]/likes - Get users who liked a comment
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { commentId } = await params;

        const likes = await prisma.commentLike.findMany({
            where: { commentId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(likes);
    } catch (error) {
        console.error('Error fetching comment likers:', error);
        return NextResponse.json({ error: 'Failed to fetch likers' }, { status: 500 });
    }
}
