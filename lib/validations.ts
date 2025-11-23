import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Post schemas
export const createPostSchema = z.object({
    content: z.string().min(1, 'Post content is required').max(5000, 'Post content is too long'),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isPublic: z.boolean().optional().default(true),
});

// Comment schemas
export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
    postId: z.string().cuid('Invalid post ID'),
    parentId: z.string().cuid('Invalid parent ID').nullish(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
