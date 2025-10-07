# ZATPLANT - Hydroponic & Horticulture Platform

## Overview

ZATPLANT is a marketing and informational website for a hydroponic farming and sustainable agriculture company. The platform showcases hydroponic solutions, educational content, team profiles, and contact capabilities. Built as a full-stack web application with a React frontend and Express backend, it provides a modern, responsive user experience for learning about hydroponic farming technologies and services.

## Recent Updates (October 2025)

### New Features Implemented
1. **Smooth Scrolling Navigation** - Seamless scroll-to-section navigation using CSS scroll-smooth and hash anchors
2. **Dropdown Navigation Menus** - Hover-activated dropdown menus for Services, Features, and Articles with icons
3. **Contact Form Backend** - POST /api/contact endpoint with Zod validation and in-memory storage
4. **Services Page** - Dedicated /services route with detailed service information, features, and benefits
5. **Articles Page** - Dedicated /articles route with article grid, category filters, and pagination UI
6. **Portfolio Gallery** - Interactive project showcase with category filtering (All, Commercial, Residential, Educational, Community)

### Navigation Updates
- All header links now use absolute paths (e.g., "/#about") to work correctly from any route
- Services and Articles have dedicated pages accessible via dropdown and main navigation
- Portfolio section added to homepage with #portfolio anchor

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- Component-based architecture with functional components and hooks

**UI Component Strategy**
- Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (colors, typography, shadows, spacing)
- Responsive design with mobile-first approach
- Custom Poppins font family for consistent branding

**State Management**
- TanStack Query (React Query) for server state management and API data caching
- React hooks (useState, useEffect) for local component state
- Custom hooks for reusable logic (use-mobile, use-toast)

**Design System**
- New York style variant from Shadcn/ui
- Neutral color base with custom brand colors (#79B42A green, #2E593F dark green, #1A472A darker green)
- Comprehensive set of pre-built UI components (buttons, forms, cards, dialogs, etc.)
- Iconify for icon management with MDI icon set

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- TypeScript for type safety across the backend
- HTTP server created with Node's built-in `http` module
- Middleware-based request processing pipeline

**Request Processing**
- JSON and URL-encoded body parsing
- Request logging middleware that captures method, path, status, duration, and response data
- Raw body capture for webhook processing
- Static file serving for production builds

**Development vs Production**
- Development: Vite middleware integration for HMR and fast refresh
- Production: Compiled bundle served as static files
- Separate build processes for client (Vite) and server (esbuild)

**Storage Interface**
- Abstract `IStorage` interface defining CRUD operations
- `MemStorage` in-memory implementation for development/testing
- Designed to be swapped with database-backed storage (PostgreSQL via Drizzle)
- Currently implements user management methods (getUser, getUserByUsername, createUser)

### Data Layer

**Database Setup (Configured but Not Implemented)**
- Drizzle ORM configured for PostgreSQL via Neon Database serverless driver
- Schema definition in `shared/schema.ts` with Zod validation
- Database migrations configured to output to `./migrations` directory
- Users table defined with UUID primary key, username, and password fields

**Type Safety**
- Shared types between frontend and backend via `shared/` directory
- Drizzle-Zod integration for runtime validation of database operations
- TypeScript path aliases for clean imports (@/, @shared/)

### Project Structure

**Monorepo Organization**
- `client/` - Frontend React application
  - `src/components/` - Reusable UI components organized by feature
  - `src/pages/` - Route-level components
  - `src/lib/` - Utility functions and configuration
  - `src/hooks/` - Custom React hooks
- `server/` - Backend Express application
  - `routes.ts` - API route definitions
  - `storage.ts` - Data access layer
  - `vite.ts` - Development server integration
- `shared/` - Shared types and schemas
- `attached_assets/` - Static assets and resources

**Build Outputs**
- Client builds to `dist/public/`
- Server builds to `dist/`
- TypeScript compilation without emit for type checking

## External Dependencies

**Database & ORM**
- PostgreSQL (via DATABASE_URL environment variable)
- Neon Database serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries
- Drizzle Kit for schema migrations

**UI & Styling**
- Radix UI primitives (accordion, dialog, dropdown, etc.) - 20+ component primitives
- Tailwind CSS with PostCSS for styling
- Class Variance Authority (CVA) for component variants
- clsx and tailwind-merge for conditional className composition

**State & Data Fetching**
- TanStack Query v5 for server state management
- React Hook Form with Zod resolvers for form validation

**Development Tools**
- Vite plugins for Replit integration (runtime error modal, cartographer, dev banner)
- TSX for TypeScript execution in development
- esbuild for production server bundling

**Third-Party Integrations**
- Iconify for icon CDN delivery
- Google Fonts (Poppins) for typography
- Unsplash & Pixabay for placeholder imagery

**Utilities**
- date-fns for date manipulation
- nanoid for unique ID generation
- Embla Carousel for image carousels
- Wouter for client-side routing (lightweight alternative to React Router)

**Session Management (Configured)**
- connect-pg-simple for PostgreSQL session storage (not yet implemented)