# Social Feed Application - Project Documentation

## 1. Project Overview
This project is a full-stack social media feed application built to handle millions of posts and reads efficiently. It features a secure authentication system, a dynamic feed with infinite scrolling, rich post creation (text + images), and a comprehensive interaction system (likes, comments, replies).

The application was built by converting static HTML/CSS templates into a modern, component-based React architecture using Next.js 14.

## 2. Technology Stack & Rationale

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Provides server-side rendering, efficient routing, and a modern React framework structure. |
| **Backend** | Next.js API Routes | Integrated serverless functions avoid the need for a separate Express server, simplifying deployment and sharing types. |
| **Database** | PostgreSQL | Chosen for ACID compliance and strong relational data integrity (Users → Posts → Comments), which is critical for a social graph. |
| **ORM** | Prisma | Type-safe database access, automated migrations, and efficient query building. |
| **Auth** | NextAuth.js | Secure, session-based authentication with built-in CSRF protection and easy provider integration. |
| **State** | React Query (TanStack) | Manages server state (caching, refetching, optimistic updates) significantly better than Redux for this use case. |
| **Images** | Cloudinary | Offloads image storage and optimization, ensuring fast delivery via CDN. |
| **Styling** | CSS Modules / Global CSS | Maintained the original design fidelity by integrating provided CSS assets directly. |

## 3. Key Architectural Decisions

### A. Database Schema Design (Relational)
We chose a relational model over NoSQL (MongoDB) because social data is inherently relational.
- **Foreign Keys**: Ensures data integrity (e.g., deleting a post cascades to delete its comments).
- **Indexing**: Added indexes on `authorId` and `createdAt` to ensure `O(log n)` query performance for the feed, even with millions of records.
- **Separate Like Tables**: `PostLike`, `CommentLike`, etc., are separate tables to prevent table bloat and allow for efficient "isLikedBy" queries.

### B. State Management Strategy
- **Server State (React Query)**: Used for all data fetching (posts, comments, user info). This allows for features like "stale-while-revalidate," automatic background refetching, and infinite scroll caching.
- **Auth State (Context)**: `SessionProvider` wraps the app to provide global access to the current user.
- **UI State (Local)**: Used `useState` for form inputs, modal visibility, and loaders. **Redux was avoided** as it would introduce unnecessary boilerplate for this scope.

### C. Performance Optimizations
- **Cursor-Based Pagination**: Implemented in `/api/posts` to handle infinite scrolling efficiently. Unlike offset-based pagination, this remains performant regardless of dataset size.
- **Optimistic UI Updates**: When a user creates a post, it appears instantly in the feed without waiting for a full re-fetch.
- **Intersection Observer**: Used for the infinite scroll trigger to load more posts only when the user reaches the bottom of the feed.
- **Global Loaders**: Implemented `SessionLoader` and `CommonLoader` to provide immediate visual feedback during async operations (login, logout, data fetching), improving perceived performance.

## 4. Features Implemented

### Authentication
- **Secure Login/Register**: Fully functional forms with Zod validation.
- **Global Session Loader**: A full-screen loader prevents "flashes of unauthenticated content" during session checks.
- **Logout Handling**: Smooth logout experience with a dedicated loading state.

### Feed & Posts
- **Infinite Scroll**: Seamlessly loads content as the user scrolls.
- **Home Button Refresh**: Clicking the "Home" icon smoothly scrolls to the top and refreshes the feed.
- **Post Creation**: Users can post text and upload images (integrated with Cloudinary).
- **Instant Updates**: New posts are prepended to the feed immediately.

### Interactions
- **Like System**: Users can like/unlike posts and comments. The UI updates instantly.
- **Comments & Replies**: Nested comment system with support for replies.
- **User Lists**: Clicking "Likes" opens a modal showing the list of users who liked the content.

## 5. Security Measures
- **Protected Routes**: Middleware ensures unauthenticated users are redirected to login.
- **API Protection**: All API routes verify the session before processing requests.
- **Input Validation**: Zod schemas validate all incoming data (registration, post creation) to prevent bad data and injection attacks.

## 6. Future Improvements (Roadmap)
- **Real-time Notifications**: Integrate WebSockets (Pusher or Socket.io) for live alerts.
- **User Profiles**: Dedicated profile pages showing user-specific posts.
- **Search Functionality**: Full-text search for posts and users.
