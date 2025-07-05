# AI Assistant Application

## Overview

This is a full-stack AI assistant application built with React frontend and Express backend. The application provides multiple AI-powered features including chat, image generation, translation, and text generation. It uses OpenAI's API for AI capabilities and PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

The application follows a modern monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: OpenAI API integration
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with dark/light theme support
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Structure**: RESTful endpoints with Express routes
- **AI Integration**: OpenAI API for chat, image generation, text processing, and code generation
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
The application uses the following main tables:
- `users`: User authentication and profiles
- `chat_messages`: Chat conversation history
- `generated_images`: Image generation records
- `translations`: Translation history
- `generated_texts`: Text generation history
- `generated_code`: Code generation records

### AI Services Integration
- **Chat**: GPT-4o model for conversational AI
- **Image Generation**: DALL-E 3 for image creation
- **Translation**: GPT-4o for multilingual translation
- **Text Generation**: GPT-4o for content creation
- **Code Generation**: GPT-4o for programming code in multiple languages

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack React Query
2. **Server Processing**: Express routes handle requests and validate input
3. **AI Service Calls**: Server integrates with OpenAI API for AI operations
4. **Database Operations**: Drizzle ORM manages data persistence
5. **Response Handling**: Results are returned to client and cached appropriately

## External Dependencies

- **OpenAI API**: Primary AI service provider for all AI operations
- **PostgreSQL**: Database for persistent data storage
- **Neon Database**: Serverless PostgreSQL provider
- **Radix UI**: Primitive components for accessible UI
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` - Runs both client and server in development mode
- **Build**: `npm run build` - Creates production build with Vite and esbuild
- **Production**: `npm run start` - Serves the built application
- **Database**: Automatic PostgreSQL provisioning through Replit
- **Environment**: Uses environment variables for API keys and database connection

The build process creates a `dist` folder containing:
- `/public`: Static frontend assets
- `/index.js`: Bundled server application

## Changelog

```
Changelog:
- June 28, 2025. Added PostgreSQL database integration
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```