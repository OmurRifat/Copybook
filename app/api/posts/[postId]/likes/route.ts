import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts/[postId]/likes - Get users who liked a post
export async function GET(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = params;

        const likes = await prisma.postLike.findMany({
            where: { postId },
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
        console.error('Error fetching post likes:', error);
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }
}
