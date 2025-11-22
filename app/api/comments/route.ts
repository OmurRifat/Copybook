import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validations';

// POST /api/comments - Create a new comment
export async function POST(request: Request) {
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

        const body = await request.json();
        const validatedData = createCommentSchema.parse(body);
        const { content, postId, parentId } = validatedData;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                userId: user.id,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
