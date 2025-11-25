import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/posts/[postId]/like - Like a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
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

        const { postId } = await params;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Create like (unique constraint will prevent duplicates)
        const like = await prisma.postLike.create({
            data: {
                postId,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true, like }, { status: 201 });
    } catch (error: any) {
        // Handle unique constraint violation (already liked)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Already liked' }, { status: 400 });
        }
        console.error('Error liking post:', error);
        return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
    }
}

// DELETE /api/posts/[postId]/like - Unlike a post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
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

        const { postId } = await params;

        // Delete the like
        await prisma.postLike.deleteMany({
            where: {
                postId,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unliking post:', error);
        return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
    }
}
