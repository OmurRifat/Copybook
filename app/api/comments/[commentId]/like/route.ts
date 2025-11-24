import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/comments/[commentId]/like - Like a comment
export async function POST(
    request: NextRequest,
    { params }: { params: { commentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { commentId } = params;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Create like (unique constraint will prevent duplicates)
        const like = await prisma.commentLike.create({
            data: {
                commentId,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true, like }, { status: 201 });
    } catch (error: any) {
        // Handle unique constraint violation (already liked)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Already liked' }, { status: 400 });
        }
        console.error('Error liking comment:', error);
        return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
    }
}

// DELETE /api/comments/[commentId]/like - Unlike a comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { commentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { commentId } = params;

        // Delete the like
        await prisma.commentLike.deleteMany({
            where: {
                commentId,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unliking comment:', error);
        return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 });
    }
}
