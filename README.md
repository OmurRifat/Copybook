# Copybook - Social Feed Application

A modern social media feed application built with Next.js 15, TypeScript, PostgreSQL, and Prisma.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (JWT-based)
- **State Management**: React Query (TanStack Query) + Context API
- **Validation**: Zod
- **Image Upload**: Cloudinary
- **Deployment**: Vercel (Frontend/API) + Railway/Supabase (Database)

## 📁 Project Structure

```
copybook/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── auth/             # Authentication endpoints
│   ├── login/                # Login page (to be created)
│   ├── register/             # Registration page (to be created)
│   ├── feed/                 # Feed page (to be created)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   └── providers.tsx         # Context providers
├── lib/                      # Utilities
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── validations.ts        # Zod schemas
├── prisma/                   # Database
│   └── schema.prisma         # Database schema
└── types/                    # TypeScript types
    └── next-auth.d.ts        # NextAuth type extensions
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
Already done! All packages are installed.

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/copybook"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Cloudinary (optional for now)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (when database is ready)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

- **User**: id, email, password, firstName, lastName
- **Post**: id, content, imageUrl, userId
- **Comment**: id, content, postId, userId, parentId (for replies)
- **Like**: id, postId, userId (unique constraint)

## 🔐 Authentication

- JWT-based authentication with NextAuth.js
- Credentials provider (email/password)
- Password hashing with bcryptjs
- Session management

## ✅ Current Status

### Completed
- ✅ Project initialization
- ✅ Dependencies installed
- ✅ Database schema created
- ✅ NextAuth configured
- ✅ Zod validation schemas
- ✅ API endpoint for registration
- ✅ Providers setup (React Query + NextAuth)

### To Do
- [ ] Login page UI
- [ ] Registration page UI
- [ ] Feed page UI
- [ ] Post creation
- [ ] Comments & replies
- [ ] Like/unlike functionality
- [ ] Image upload integration

## 🎯 Next Steps

Choose what to build next:
1. **Login Page** - Create the login UI and integrate with NextAuth
2. **Registration Page** - Create the registration UI with first name & last name fields
3. **Feed Page** - Create the main feed layout
4. **Database Migration** - Set up PostgreSQL and run migrations

## 📝 Notes

- Application name in `package.json` is lowercase "copybook" (npm requirement)
- All components use TypeScript for type safety
- Tailwind CSS configured for styling
- Ready for minimal, requirements-only development with scope for future enhancements
