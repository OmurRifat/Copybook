import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';

// GET /api/posts - Fetch all posts (public + user's private posts) with pagination
export async function GET(request: NextRequest) {
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

        // Get pagination params from query string
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const cursor = searchParams.get('cursor'); // Post ID to start after

        // Build where clause
        const whereClause: any = {
            OR: [
                { isPublic: true },
                { userId: user.id, isPublic: false }
            ]
        };

        // Add cursor condition if provided
        if (cursor) {
            whereClause.id = { lt: cursor }; // Get posts with ID less than cursor (older posts)
        }

        // Fetch posts with pagination
        const posts = await prisma.post.findMany({
            where: whereClause,
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
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit + 1 // Fetch one extra to determine if there are more
        });

        // Check if there are more posts
        const hasMore = posts.length > limit;
        const returnPosts = hasMore ? posts.slice(0, limit) : posts;
        const nextCursor = hasMore ? returnPosts[returnPosts.length - 1].id : null;

        return NextResponse.json({
            posts: returnPosts,
            hasMore,
            nextCursor
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
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
        const validatedData = createPostSchema.parse(body);
        const { content, imageUrl, isPublic = true } = validatedData;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                content: content.trim(),
                imageUrl: imageUrl || null,
                isPublic,
                userId: user.id
            },
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
                        comments: true
                    }
                }
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
