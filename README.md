# (b)log - Personal Blog Platform

A clean, modern, and intuitive full-stack blog platform built with Next.js, Firebase, and Cloudinary. Features a minimalist design with developer aesthetics, perfect for sharing thoughts, tutorials, and articles.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.6-orange?style=flat&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)

## 🎯 Project Overview

(b)log is a full-stack blog platform that demonstrates clean, modular, and maintainable code architecture. It provides a seamless experience for both content creators (admins) and readers, with features like post management, search, filtering, and image uploads.

### Key Features

- ✅ **Blog CRUD Operations** - Create, read, update, and delete blog posts
- ✅ **Tag System** - Organize posts with tags and filter by them
- ✅ **Advanced Search** - Search posts by title, content, excerpt, or tags
- ✅ **Image Upload** - Upload images via Cloudinary or use image URLs
- ✅ **Admin Authentication** - Secure admin access with Firebase Auth
- ✅ **Responsive Design** - Clean, minimal UI that works on all devices
- ✅ **Public Access** - All posts are publicly viewable without login

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase account (free tier available)
- Cloudinary account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/kunospw/b-log.git>
   cd blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase, Cloudinary, and Gemini credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Set up Firebase**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password)
   - Create a Firestore Database (start in test mode)
   - Add Firestore security rules (see below)
   - Copy your Firebase config values to `.env.local`
   - **Create an admin user** in Firebase Authentication:
     - Go to Authentication → Users → Add user
     - Email: `admin@blog.com`
     - Password: `admin1234`
     - Or use the test credentials below if already set up

5. **Set up Cloudinary**
   
   - Go to [Cloudinary](https://cloudinary.com/) and create a free account
   - Get your Cloud Name from the dashboard
   - Create an unsigned upload preset:
     - Go to Settings → Upload
     - Add upload preset
     - Set signing mode to "Unsigned"
     - Save the preset name
   - Add values to `.env.local`

6. **Set up Gemini API (Optional - for AI content generation)**
   
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey) and create a free account
   - Generate an API key
   - Add `NEXT_PUBLIC_GEMINI_API_KEY=your-api-key` to `.env.local`
   - Note: The AI content generation feature will not work without this key

7. **Configure Firestore Security Rules**
   
   In Firebase Console → Firestore Database → Rules, add:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /posts/{postId} {
         allow read: if true;
         allow create, update, delete: if request.auth != null;
       }
     }
   }
   ```

8. **Run the development server**
   ```bash
   npm run dev
   ```

9. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔐 Test Admin Credentials

For testing purposes, you can use the following admin credentials:

- **Email**: `admin@blog.com`
- **Password**: `admin1234`

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.0** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database for posts
- **Cloudinary** - Image upload and storage
- **Google Gemini API** - AI-powered content generation and summarization

### UI Components
- **shadcn/ui inspired components** - Custom components built with Tailwind CSS
  - Button, Input, Textarea, Card, Badge, Alert, Dialog, Toast, Skeleton, Pagination, MarkdownEditor
- **react-markdown** - Markdown rendering with GitHub Flavored Markdown support
- **remark-gfm** - GitHub Flavored Markdown plugin

## 📁 Project Structure

```
blog/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin pages
│   │   │   ├── page.tsx        # Admin login
│   │   │   ├── posts/          # Admin dashboard
│   │   │   ├── new/            # Create post
│   │   │   └── edit/[id]/      # Edit post
│   │   ├── post/[id]/          # Individual post view
│   │   ├── layout.tsx          # Root layout with navbar
│   │   ├── page.tsx            # Homepage (blog listing)
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── markdown-editor.tsx
│   │   └── navbar.tsx          # Navigation bar
│   └── lib/                    # Utility functions
│       ├── auth.ts             # Firebase auth helpers
│       ├── posts.ts            # Post CRUD operations
│       ├── firebase.ts         # Firebase configuration
│       ├── cloudinary.ts       # Cloudinary upload helper
│       └── gemini.ts           # Gemini API integration
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── .env.local                  # Your local environment variables (not in git)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Routes / Data Operations

This project uses Firebase Firestore directly from the client. All data operations are handled through utility functions in `src/lib/posts.ts`:

### Post Operations

- `getAllPosts()` - Fetch all posts, ordered by creation date (descending)
- `getPostById(id)` - Fetch a single post by ID
- `createPost(post)` - Create a new post (admin only)
- `updatePost(id, updates)` - Update an existing post (admin only)
- `deletePost(id)` - Delete a post (admin only)
- `searchPosts(query)` - Search posts by title, content, excerpt, or tags
- `filterPostsByTag(tag)` - Filter posts by a specific tag
- `getAllTags()` - Get all unique tags from all posts

### Authentication Operations (`src/lib/auth.ts`)

- `login(email, password)` - Authenticate admin user
- `logout()` - Sign out current user
- `isAuthenticated()` - Check if user is logged in
- `getCurrentUser()` - Get current authenticated user
- `onAuthChange(callback)` - Listen to auth state changes

### Image Upload Operations (`src/lib/cloudinary.ts`)

- `uploadImage(file)` - Upload image file to Cloudinary and return URL

### AI Operations (`src/lib/gemini.ts`)

- `generatePostContent(prompt)` - Generate complete blog post (title, content, excerpt, tags) from prompt
- `summarizePost(content)` - Generate AI summary of post content

## ✨ Features Implemented

### Core Features
- ✅ **Blog CRUD** - Full create, read, update, delete functionality
- ✅ **Search** - Search posts by text (title, content, excerpt, tags) with URL-based query params
- ✅ **Tag Filtering** - Filter posts by tags with clickable tag badges and visual feedback
- ✅ **Public View** - All posts accessible without authentication
- ✅ **Admin Auth** - Secure admin access with Firebase Authentication
- ✅ **Image Upload** - Upload images via Cloudinary or use URLs
- ✅ **AI Content Generation** - Generate blog posts using Google Gemini API
- ✅ **AI Summarization** - AI-powered post summarization on post detail pages
- ✅ **Markdown Support** - Rich text editing with markdown and live preview
- ✅ **Pagination** - Paginated post listing (9 posts per page)
- ✅ **Responsive Design** - Mobile-friendly layout

### UI/UX Features
- ✅ Clean, minimal design with developer aesthetics
- ✅ Monospace font for branding (b)log
- ✅ Loading states for async operations
- ✅ Error handling with user-friendly messages
- ✅ Image preview before upload
- ✅ Tag badges with visual feedback
- ✅ Search bar in navbar
- ✅ Smooth transitions and hover effects
- ✅ Toast notifications for user feedback
- ✅ Dialog modals for confirmations
- ✅ Loading skeletons for better UX
- ✅ Markdown editor with formatting toolbar
- ✅ Pagination controls with page numbers

## 🎨 Design Philosophy

The design follows a clean, Dev-code aesthetic:
- **Minimal borders** and neutral colors
- **Generous spacing** for readability
- **One-column, centered layout**
- **Subtle developer vibes** (monospace logo only)
- **No clutter** - focused on content

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to main branch.

### Deployed Demo Link

**Add your deployed link here after deployment:**
```
https://b-log-five.vercel.app/
```

### Environment Variables for Production

Make sure to add all environment variables in your deployment platform:
- All `NEXT_PUBLIC_FIREBASE_*` variables
- All `NEXT_PUBLIC_CLOUDINARY_*` variables
- `NEXT_PUBLIC_GEMINI_API_KEY` (optional, for AI features)

## 🤖 LLM Integration (Bonus Feature)

This project includes AI-powered features using Google's Gemini API:

### Features

1. **AI Content Generation** (`/admin/new`)
   - Generate complete blog posts from a simple prompt
   - Automatically creates title, content, excerpt, and tags
   - Uses Gemini 2.0 Flash model for fast generation
   - Content is editable before submission

2. **AI Summarization** (`/post/[id]`)
   - One-click AI summary generation for any post
   - Creates concise 2-3 sentence summaries
   - Helps readers quickly understand post content

### Setup

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `NEXT_PUBLIC_GEMINI_API_KEY=your-key` to `.env.local`
3. Features will be available immediately

### Technical Details

- **Model**: Gemini 2.0 Flash
- **Library**: `@google/generative-ai`
- **Error Handling**: Comprehensive error messages for API issues
- **Optional**: App works without API key (features disabled)

## 🔮 Future Improvements / Bonus Features

### Completed Bonus Features
- [x] **LLM Integration** - AI-powered content generation and summarization using Gemini API ✅
- [x] **Markdown Support** - Rich text editing with markdown and live preview ✅
- [x] **Pagination** - Paginated post listing for better performance ✅
- [ ] **Comments System** - Allow readers to comment on posts
- [ ] **Draft Posts** - Save posts as drafts before publishing
- [ ] **Post Scheduling** - Schedule posts for future publication
- [ ] **Analytics Dashboard** - View post views and engagement
- [ ] **RSS Feed** - Generate RSS feed for blog posts
- [ ] **SEO Optimization** - Meta tags and Open Graph support
- [ ] **Dark Mode** - Toggle between light and dark themes
- [ ] **Multi-user Support** - Support for multiple admin users

### Code Quality Improvements
- [ ] Unit tests with Jest/Vitest
- [ ] E2E tests with Playwright
- [ ] Error boundary components
- [ ] Loading skeletons
- [ ] Optimistic UI updates

## 📝 Code Quality Notes

This project emphasizes:

- **Import Organization** - Grouped imports (React, Next.js, components, utilities)
- **Hooks & State Management** - Proper use of React hooks and state patterns
- **Naming Conventions** - Clear, descriptive variable and function names
- **File Organization** - Logical folder structure with separation of concerns
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Try-catch blocks and user-friendly error messages

## 📄 License

This project is open source and available for educational purposes.

## 👤 Author

Built as a technical test for Elice Front-end developer role

---
