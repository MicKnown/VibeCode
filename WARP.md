# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
EntryAI-VibeSDK is Cloudflare's official AI-powered webapp generator that creates React applications from natural language prompts. It's a full-stack application running on Cloudflare's platform including Workers, D1, Durable Objects, and Containers.

**Core Functionality**: AI agents (via Durable Objects) generate complete web applications phase-wise from user descriptions, with live previews in sandboxed containers and one-click deployment to Workers for Platforms.

## Essential Development Commands

### Frontend Development
```bash
npm run dev              # Start Vite dev server with hot reload (PORT 5173)
npm run build            # Build production frontend
npm run lint             # Run ESLint with TypeScript support
npm run preview          # Preview production build locally
```

### Worker & Backend
```bash
npm run setup            # Interactive setup script for CF resources and environment
bun run deploy           # Deploy to Cloudflare Workers with secrets
npm run cf-typegen       # Generate TypeScript types for Cloudflare bindings
```

### Database (D1) Management
```bash
npm run db:setup         # Initialize D1 database and run migrations
npm run db:generate      # Generate Drizzle migrations locally
npm run db:migrate:local # Apply migrations to local D1 database
npm run db:migrate:remote # Apply migrations to production D1 database
npm run db:studio        # Open Drizzle Studio for local database exploration
npm run db:studio:remote # Open Drizzle Studio for remote database
```

### Testing & Quality Assurance
```bash
npm run test             # Run Vitest test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
npm run knip             # Analyze unused dependencies/exports
npm run knip:fix         # Auto-fix unused code issues
```

## Core Architecture

### AI Code Generation Engine
The heart of the system is a sophisticated **phase-wise code generation system** implemented via Durable Objects:

**Key Component**: `worker/agents/codegen/phasewiseGenerator.ts` - Stateful Durable Object that:
- Analyzes user requirements and creates project blueprints
- Generates code incrementally across 6 phases (Planning → Foundation → Core → Styling → Integration → Optimization)
- Uses **SCOF Protocol** (Structured Code Output Format) for streaming file generation
- Implements multiple review cycles with static analysis, runtime validation, and AI-powered error correction
- Supports unified diff format for efficient file updates

**State Management**: `worker/agents/codegen/state.ts` tracks generation progress across WebSocket connections.

### Real-time Communication
- **Initial Request**: `POST /api/agent` creates a new generation session
- **WebSocket Protocol**: `/api/agent/:agentId/ws` provides real-time updates during code generation
- **Message Types**: Typed protocol handles file updates, errors, phase transitions, and progress streaming

### Container Execution & Validation
Generated applications run in **Cloudflare Containers** with configurable instance types:
- **Runner Service**: External service executes code in isolated environments
- **Preview Generation**: Live app previews with screenshot capture
- **Error Validation**: Runtime error feedback integrated into generation cycles

### Full Cloudflare Stack Integration
- **Workers**: Serverless compute with Hono.js framework
- **D1**: SQLite database with Drizzle ORM schema (`worker/database/schema.ts`)
- **Durable Objects**: Stateful agents for long-running generation processes
- **R2**: Object storage for templates and assets (planned)
- **KV**: Session storage and caching
- **AI Gateway**: Unified interface for multiple LLM providers
- **Containers**: Sandboxed app execution and validation

## Development Workflows

### Adding New Generation Features
1. Modify agent logic in `worker/agents/codegen/phasewiseGenerator.ts`
2. Update state types in `worker/agents/codegen/state.ts`
3. Add WebSocket message types in appropriate protocol files
4. Update frontend WebSocket handler in `src/routes/chat/hooks/use-chat.ts`

### Database Schema Changes
1. Modify `worker/database/schema.ts`
2. Generate migrations: `npm run db:generate`
3. Apply locally: `npm run db:migrate:local`
4. Test thoroughly, then apply to production: `npm run db:migrate:remote`

### Testing Strategy Requirements
**Critical Note**: Current test suite contains AI-generated placeholder tests that need complete replacement.

Priority testing needs:
- Unit tests for core generation logic in `worker/agents/`
- Integration tests for Durable Objects state management
- E2E tests for complete generation workflows
- WebSocket protocol testing
- Container integration validation

### Environment Configuration
Development requires `.dev.vars` with:
- AI Provider Keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_STUDIO_API_KEY`
- JWT management: `JWT_SECRET`
- Service integration: `RUNNER_SERVICE_API_KEY`
- OAuth credentials (optional): `GITHUB_CLIENT_ID`, `GOOGLE_CLIENT_ID`, etc.

Production deployment uses `.prod.vars` and `bun run deploy` script.

### Container Instance Configuration
Set `SANDBOX_INSTANCE_TYPE` environment variable:
- `standard-3` (default): 2 vCPU, 12 GiB memory - optimal balance
- `standard-4`: 4 vCPU, 12 GiB memory - maximum performance
- `lite`: 1/16 vCPU, 256 MiB memory - development only

## Architecture Patterns & Constraints

### Cloudflare-Native Development
- **Durable Objects**: Use for stateful operations and long-running processes
- **Service Bindings**: Access external services via environment bindings
- **D1 Database**: Use batch operations for optimal performance
- **Environment Bindings**: Access resources via `env` parameter (AI, DB, CodeGenObject)

### Code Quality Standards
- Strict TypeScript: Never use `any` type, define proper interfaces
- No dynamic imports: Use static imports only
- DRY principles: Eliminate code duplication
- Professional comments: Focus on explaining complex logic, not changes

### Authentication Architecture Status
**Warning**: Current authentication system (`worker/auth/` and related controllers) requires security review and potential rewrite. OAuth implementations and JWT session management need production hardening.

## Project-Specific Context

### Technology Stack
- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS 4
- **Backend**: Cloudflare Workers + Hono.js
- **Database**: D1 (SQLite) with Drizzle ORM
- **AI Integration**: Multiple providers via Cloudflare AI Gateway
- **Container Runtime**: Cloudflare Containers for app execution
- **Package Management**: Bun preferred, npm fallback

### Key Dependencies
- `@cloudflare/containers`: Container management
- `@cloudflare/sandbox`: Sandboxed execution
- `hono`: Web framework for Workers
- `drizzle-orm`: Database ORM
- `monaco-editor`: Code editor with CSP configuration
- `partysocket`: WebSocket client library
- `zod`: Runtime type validation

### Build System
- **Vite**: Frontend bundler with Rolldown integration
- **TypeScript**: Strict mode enabled with multiple tsconfig files
- **ESLint**: Comprehensive linting with TypeScript support
- **Knip**: Dependency analysis and dead code elimination

This codebase represents a production-grade AI application development platform. Focus on the core generation engine when making changes, prioritize Cloudflare-native solutions, and maintain high code quality standards throughout development.

<citations>
<document>
<document_type>RULE</document_type>
<document_id>WKerMjhYcyudaJoLIZSKW4</document_id>
</document>
<document>
<document_type>WARP_DOCUMENTATION</document_type>
<document_id>getting-started/quickstart-guide/coding-in-warp</document_id>
</document>
</citations>