import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await params;

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true
                    }
                },
                likes: {
                    where: {
                        userId: user.id
                    },
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const commentsWithLikeStatus = comments.map((comment) => {
            const { likes, ...commentData } = comment;
            return {
                ...commentData,
                isLikedByCurrentUser: likes.length > 0
            };
        });

        return NextResponse.json(commentsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}