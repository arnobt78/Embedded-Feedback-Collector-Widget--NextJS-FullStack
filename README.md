# Embedded Feedback Collection System - Next.js, MongoDB FullStack Project

A modern, production-ready feedback collection widget system built with Next.js, React, TypeScript, Prisma, and MongoDB. This project provides an embeddable web component that can be integrated into any website, along with a comprehensive dashboard for managing projects, viewing feedback, and analyzing insights.

**Live-Demo:** [https://embedded-feedback.vercel.app/dashboard](https://embedded-feedback.vercel.app/dashboard)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technology Stack](#️-technology-stack)
4. [Getting Started](#-getting-started)
5. [Environment Variables](#-environment-variables)
6. [Project Structure](#-project-structure)
7. [API Endpoints](#-api-endpoints)
8. [Widget Integration Guide](#-widget-integration-guide)
9. [Dashboard Overview](#-dashboard-overview)
10. [Components & Reusability](#-components--reusability)
11. [Database Schema](#️-database-schema)
12. [Development Scripts](#-development-scripts)
13. [Deployment](#-deployment)
14. [Keywords & Topics](#️-keywords--topics)
15. [Learning Resources](#-learning-resources)
16. [Tips & Best Practices](#-tips--best-practices)
17. [Troubleshooting](#-troubleshooting)
18. [License](#-license)

---

## 📖 Project Overview

This is a full-stack feedback collection system that allows you to:

- **Embed a feedback widget** into any website using a simple HTML tag
- **Manage multiple projects** with unique API keys for each project
- **Collect user feedback** including messages, ratings, and contact information
- **View and analyze feedback** through a comprehensive dashboard
- **Export data** in CSV format for further analysis
- **Monitor analytics** with charts and statistics

The widget is built as a **Web Component** using Shadow DOM for style isolation, making it safe to embed in any website without CSS conflicts. The dashboard is a Next.js application with a modern, responsive UI built with Tailwind CSS and shadcn/ui components.

---

## ✨ Features

### Widget Features

- 🎨 **Beautiful UI**: Modern, accessible feedback form with star ratings
- 🔒 **Style Isolation**: Shadow DOM prevents CSS conflicts with host websites
- ⚡ **Lightweight**: Optimized bundle size for fast loading
- 🌐 **Cross-Origin Support**: CORS-enabled for embedding on any domain
- 🔑 **API Key Authentication**: Associate feedback with specific projects
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ✨ **Real-time Validation**: Instant form validation and error handling

### Dashboard Features

- 📊 **Overview Dashboard**: Key statistics and metrics at a glance
- 📝 **Feedback Management**: View, filter, sort, and search all feedback entries
- 🗂️ **Project Management**: Create, edit, and manage multiple projects
- 📈 **Business Insights**: Visual analytics with charts and graphs
- 🔑 **API Key Management**: Generate, copy, and regenerate API keys
- 📤 **CSV Export**: Export feedback data for external analysis
- 🎨 **Dark Mode**: Beautiful dark theme support
- 📱 **Fully Responsive**: Mobile-first design that works on all screen sizes

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Unstyled, accessible component primitives
- **React Hook Form** - Performant forms with validation
- **Zod** - Schema validation library
- **TanStack React Query** - Server state management
- **TanStack React Table** - Powerful table component
- **Recharts** - Composable charting library
- **Sonner** - Toast notification library
- **date-fns** - Date utility library
- **Lucide React** - Beautiful icon library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **MongoDB** - NoSQL document database

### Build Tools

- **Vite** - Fast build tool for widget bundle
- **Turbopack** - Next.js bundler (development)
- **TypeScript Compiler** - Type checking and compilation
- **Tailwind CSS CLI** - CSS processing and minification

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **MongoDB** database (local or cloud like MongoDB Atlas)
- Basic knowledge of React, Next.js, and TypeScript

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd feedback-widget
```

1. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

1. **Set up environment variables**

See [Environment Variables](#-environment-variables) section for details.

1. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# (Optional) Push schema to database (for initial setup)
npx prisma db push
```

1. **Build the widget**

```bash
npm run build:widget
```

1. **Start the development server**

```bash
npm run dev
```

1. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000) to see the homepage with the widget.

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the dashboard.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# MongoDB Database Connection URL
# Format for MongoDB Atlas (cloud):
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority&appName=<dbname>"

# Format for local MongoDB:
DATABASE_URL="mongodb://localhost:27017/feedback_widget_db"

# Format for MongoDB with authentication:
DATABASE_URL="mongodb://<username>:<password>@<host>:<port>/<dbname>?authSource=<auth-db>"
```

### Getting Your MongoDB Connection String

#### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user (username and password)
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs in development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `<dbname>` with your database name

Example:

```env
DATABASE_URL="mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/feedback_widget_db?retryWrites=true&w=majority&appName=feedback_widget"
```

#### Option 2: Local MongoDB

1. Install MongoDB locally ([Installation Guide](https://www.mongodb.com/docs/manual/installation/))
2. Start MongoDB service
3. Use the connection string:

```env
DATABASE_URL="mongodb://localhost:27017/feedback_widget_db"
```

#### Option 3: Docker MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use:

```env
DATABASE_URL="mongodb://localhost:27017/feedback_widget_db"
```

### Example `.env` File

See `.env.example` in the repository for a template:

```env
# Environment variables for feedback-widget
# Replace <username>, <password>, <cluster-url>, <dbname> with your MongoDB details

DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority&appName=<dbname>"
```

---

## 📁 Project Structure

```bash
feedback-widget/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── public/
│   ├── widget.umd.js          # Built widget bundle (generated)
│   ├── widget-styles.css      # Widget CSS (generated)
│   └── test-widget.html       # Example HTML for testing widget
├── scripts/
│   ├── build-widget-css.js    # CSS build script
│   ├── inject-css-inline.js   # CSS injection script
│   └── migrate-to-projects.ts # Migration script
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── feedback/
│   │   │   │   └── route.ts   # Feedback CRUD API
│   │   │   ├── projects/
│   │   │   │   ├── route.ts   # Projects list/create API
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # Project update/delete API
│   │   │   └── business-insights/
│   │   │       └── route.ts   # Analytics API
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── page.tsx       # Overview dashboard
│   │   │   ├── feedback/
│   │   │   │   ├── page.tsx   # Feedback list page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Feedback detail page
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx   # Projects list page
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Create project page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit project page
│   │   │   └── business-insights/
│   │   │       └── page.tsx   # Analytics page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── Widget.tsx         # Main feedback widget component
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── feedback-table.tsx
│   │   │   ├── feedback-table-filters.tsx
│   │   │   ├── project-form.tsx
│   │   │   └── chart-container.tsx
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   └── providers/
│   │       ├── query-provider.tsx
│   │       └── theme-provider.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-feedback.ts    # Feedback data fetching
│   │   ├── use-projects.ts    # Projects data fetching
│   │   └── use-analytics.ts   # Analytics data fetching
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── api-utils.ts       # API helper functions
│   │   ├── export-utils.ts    # CSV export utilities
│   │   ├── query-client.ts    # React Query client
│   │   └── utils.ts           # General utilities
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── web-component.tsx      # Web Component wrapper
│   ├── widget-styles.ts       # Widget styles export
│   └── globals.css            # Global styles
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.widget.js      # Vite config for widget build
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 🔌 API Endpoints

### Feedback API

#### `POST /api/feedback`

Create a new feedback entry.

**Headers:**

- `Content-Type: application/json`
- `X-API-Key: <your-api-key>` (optional, for project association)

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great product!",
  "rating": 5
}
```

**Response:** `201 Created`

```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great product!",
  "rating": 5,
  "projectId": "...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/feedback`

Get all feedback entries (optionally filtered by project).

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:** `200 OK`

```json
[
  {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great product!",
    "rating": 5,
    "projectId": "...",
    "project": {
      "id": "...",
      "name": "My Project",
      "domain": "https://example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Projects API

#### `GET /api/projects`

Get all projects.

**Response:** `200 OK`

```json
[
  {
    "id": "...",
    "name": "My Project",
    "domain": "https://example.com",
    "apiKey": "...",
    "description": "Project description",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "feedbacks": 10
    }
  }
]
```

#### `POST /api/projects`

Create a new project.

**Request Body:**

```json
{
  "name": "My Project",
  "domain": "https://example.com",
  "description": "Project description"
}
```

**Response:** `201 Created`

```json
{
  "id": "...",
  "name": "My Project",
  "domain": "https://example.com",
  "apiKey": "generated-api-key",
  "description": "Project description",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/projects/[id]`

Get a specific project by ID.

#### `PUT /api/projects/[id]`

Update a project.

**Request Body:**

```json
{
  "name": "Updated Name",
  "domain": "https://updated.com",
  "description": "Updated description",
  "isActive": true,
  "regenerateApiKey": false
}
```

#### `DELETE /api/projects/[id]`

Delete a project.

### Business Insights API

#### `GET /api/business-insights`

Get analytics data.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:** `200 OK`

```json
{
  "totalFeedback": 100,
  "averageRating": 4.5,
  "ratedFeedbackCount": 80,
  "ratingDistribution": [
    { "rating": 1, "count": 5 },
    { "rating": 2, "count": 10 },
    { "rating": 3, "count": 15 },
    { "rating": 4, "count": 30 },
    { "rating": 5, "count": 40 }
  ],
  "feedbackByProject": [
    {
      "projectId": "...",
      "projectName": "My Project",
      "count": 50
    }
  ],
  "recent7Days": 20,
  "recent30Days": 60,
  "totalProjects": 5
}
```

---

## 🔧 Widget Integration Guide

### Basic Integration

Add the widget to any HTML page with just a few lines:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to My Website</h1>

    <!-- Load React and ReactDOM UMD builds (required for widget) -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- Load the widget script from your deployment -->
    <script src="https://embedded-feedback.vercel.app/widget.umd.js"></script>

    <!-- Embed the widget -->
    <my-widget
      api-base="https://embedded-feedback.vercel.app/api/feedback"
      api-key="your-api-key-here"
    ></my-widget>
  </body>
</html>
```

### Integration with Project API Key

1. **Create a project** in the dashboard at `/dashboard/projects/new`
2. **Copy the API key** from the project details
3. **Use the API key** in the `api-key` attribute:

```html
<my-widget
  api-base="https://embedded-feedback.vercel.app/api/feedback"
  api-key="1e61d9ba70b084b5f8291f2aa75e67d9"
></my-widget>
```

### Integration in React/Vue/Angular

The widget works in any framework! Just include the script tags and use the `<my-widget>` tag:

**React Example:**

```jsx
function App() {
  return (
    <div>
      <h1>My React App</h1>
      <my-widget
        api-base="https://embedded-feedback.vercel.app/api/feedback"
        api-key="your-api-key"
      />
    </div>
  );
}
```

**Vue Example:**

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <my-widget
      api-base="https://embedded-feedback.vercel.app/api/feedback"
      api-key="your-api-key"
    />
  </div>
</template>
```

### Local Development

For local development, use:

```html
<my-widget
  api-base="http://localhost:3000/api/feedback"
  api-key="your-api-key"
></my-widget>
```

### Widget Attributes

- `api-base` (required): The API endpoint URL for submitting feedback
- `api-key` (optional): API key for project association (if not provided, uses default project)

---

## 📊 Dashboard Overview

### Accessing the Dashboard

After deploying or running locally, access the dashboard at:

- **Production:** [https://embedded-feedback.vercel.app/dashboard](https://embedded-feedback.vercel.app/dashboard)
- **Local:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Dashboard Pages

#### 1. Overview (`/dashboard`)

- Total feedback count
- Active projects count
- Average rating
- Recent feedback (last 7 days)
- Additional statistics (last 30 days, high ratings, satisfaction rate)
- Quick action cards

#### 2. Feedback (`/dashboard/feedback`)

- Table view of all feedback entries
- Filter by project and rating
- Search functionality
- Sort by date, rating, project
- Pagination
- CSV export
- Column visibility toggle
- Detail view for each feedback entry

#### 3. Projects (`/dashboard/projects`)

- List of all projects
- Create new project
- Edit project details
- Delete project
- View API keys
- Copy API keys
- Project status (active/inactive)
- Feedback count per project

#### 4. Business Insights (`/dashboard/business-insights`)

- Rating distribution charts (Bar and Area)
- Feedback by project (Pie and Bar charts)
- Time-based statistics
- Interactive tooltips
- Responsive charts with horizontal scrolling on mobile

---

## 🧩 Components & Reusability

### Widget Component

**Location:** `src/components/Widget.tsx`

The main feedback widget component that can be used directly in React applications.

```tsx
import Widget from "@/components/Widget";

function MyPage() {
  return (
    <Widget
      apiBase="https://embedded-feedback.vercel.app/api/feedback"
      apiKey="your-api-key"
    />
  );
}
```

**Props:**

- `apiBase?: string` - API endpoint URL (default: "/api/feedback")
- `apiKey?: string` - API key for project association

### Dashboard Components

#### StatCard

**Location:** `src/components/dashboard/stat-card.tsx`

Displays a statistic with icon, value, description, and optional loading state.

```tsx
import { StatCard } from "@/components/dashboard/stat-card";
import { MessageSquare } from "lucide-react";

<StatCard
  title="Total Feedback"
  value={100}
  description="All time feedback submissions"
  icon={MessageSquare}
  isLoading={false}
  colorVariant="sky"
/>;
```

#### FeedbackTable

**Location:** `src/components/dashboard/feedback-table.tsx`

Complete feedback table with filtering, sorting, pagination, and export.

```tsx
import { FeedbackTable } from "@/components/dashboard/feedback-table";

<FeedbackTable
  data={feedbackData}
  isLoading={false}
  projects={projectsData}
  onProjectFilter={(projectId) => {}}
  onRatingFilter={(rating) => {}}
/>;
```

#### ProjectForm

**Location:** `src/components/dashboard/project-form.tsx`

Form component for creating/editing projects with validation.

```tsx
import { ProjectForm } from "@/components/dashboard/project-form";

<ProjectForm
  defaultValues={projectData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>;
```

### UI Components

All UI components are from shadcn/ui and can be imported and used directly:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
```

### Custom Hooks

#### useFeedback

**Location:** `src/hooks/use-feedback.ts`

React Query hook for fetching feedback data.

```tsx
import { useFeedback } from "@/hooks/use-feedback";

function MyComponent() {
  const { data, isLoading, error } = useFeedback(projectId);
  // ...
}
```

#### useProjects

**Location:** `src/hooks/use-projects.ts`

React Query hooks for project management.

```tsx
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
} from "@/hooks/use-projects";

function MyComponent() {
  const { data: projects } = useProjects();
  const createProject = useCreateProject();

  const handleCreate = async () => {
    await createProject.mutateAsync({
      name: "New Project",
      domain: "https://example.com",
      description: "Description",
    });
  };
}
```

#### useAnalytics

**Location:** `src/hooks/use-analytics.ts`

React Query hook for fetching analytics data.

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function MyComponent() {
  const { data: analytics, isLoading } = useAnalytics(projectId);
  // ...
}
```

---

## 🗄️ Database Schema

### Project Model

```prisma
model Project {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  domain      String
  apiKey      String     @unique
  description String?
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  feedbacks   Feedback[]
}
```

### Feedback Model

```prisma
model Feedback {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  projectId String?   @db.ObjectId
  project   Project?  @relation(fields: [projectId], references: [id])
  name      String?
  email     String?
  message   String
  rating    Int?
  metadata  Json?
  createdAt DateTime  @default(now())

  @@index([projectId])
  @@index([createdAt])
}
```

### Schema Modifications

To modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to regenerate Prisma Client
3. Run `npx prisma db push` to sync schema with database (development)
4. Or create a migration: `npx prisma migrate dev --name your-migration-name`

---

## 📜 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Build widget only
npm run build:widget

# Build widget CSS only
npm run build:widget-css

# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import project in Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure environment variables**

   - Add `DATABASE_URL` in Vercel project settings
   - Environment → Add New → `DATABASE_URL`

4. **Deploy**

   - Vercel will automatically build and deploy
   - The widget bundle will be generated during build

5. **Update widget URLs**
   - After deployment, update widget script URLs to your Vercel domain
   - Example: `https://your-project.vercel.app/widget.umd.js`

### Build Process

The build process includes:

1. **Prisma Client Generation**: `npx prisma generate`
2. **Next.js Build**: `next build`
3. **Widget Build**: Builds the widget bundle with Vite

The widget bundle (`widget.umd.js`) and styles (`widget-styles.css`) are output to the `public/` directory and served as static files.

---

## 🏷️ Keywords & Topics

feedback widget, embedded feedback, web component, shadow dom, nextjs, react, typescript, prisma, mongodb, dashboard, analytics, api, vercel, tailwindcss, shadcn ui, react query, tanstack table, recharts, feedback collection, customer feedback, user feedback, feedback management, project management, api key authentication, cors, cross-origin, embeddable widget, feedback form, star rating, csv export, business insights, data visualization, responsive design, dark mode, fullstack, full-stack, teaching, learning, example project, production-ready, modern web development

---

## 🎓 Learning Resources

This project demonstrates:

- **Web Components**: Creating custom HTML elements with Shadow DOM
- **Next.js App Router**: Modern Next.js routing and API routes
- **React Patterns**: Custom hooks, component composition, state management
- **TypeScript**: Type-safe development with interfaces and types
- **Prisma ORM**: Type-safe database queries and schema management
- **API Design**: RESTful APIs with CORS support
- **Dashboard Development**: Building admin interfaces with tables, charts, and filters
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Build Optimization**: Separate widget bundle for performance
- **Modern Tooling**: Vite, Turbopack, and modern build pipelines

---

## 💡 Tips & Best Practices

1. **API Key Security**: Keep your API keys secret. Never commit them to version control.

2. **CORS Configuration**: The API allows all origins (`*`) for widget embedding. For production, consider restricting to specific domains.

3. **Database Indexes**: The schema includes indexes on `projectId` and `createdAt` for optimal query performance.

4. **Widget Bundle Size**: The widget is built separately to minimize bundle size. Keep widget dependencies minimal.

5. **Error Handling**: All API routes include error handling. Check browser console and server logs for debugging.

6. **Environment Variables**: Use `.env.local` for local development (git-ignored) and `.env.example` for documentation.

---

## 🐛 Troubleshooting

### Widget not appearing

- Check browser console for errors
- Ensure React and ReactDOM scripts are loaded before widget script
- Verify the widget script URL is correct
- Check CORS headers in network tab

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check MongoDB connection (Atlas IP whitelist, credentials)
- Ensure Prisma Client is generated: `npx prisma generate`
- Try connecting with MongoDB Compass to test connection

### Build errors

- Clear `.next` directory: `rm -rf .next`
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Regenerate Prisma Client: `npx prisma generate`
- Check Node.js version (requires 18+)

---

## 📝 License

This project is open source and available for learning and educational purposes.

---

## Happy Coding

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
