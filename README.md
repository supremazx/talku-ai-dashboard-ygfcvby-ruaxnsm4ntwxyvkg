# TalkU AI Dashboard

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/supremazx/talku-ai-ai-voice-agent-management-platform)

A full-stack chat dashboard built on Cloudflare Workers with Durable Objects for scalable, stateful entities (Users, Chats, Messages). Features a modern React frontend with shadcn/ui, Tailwind CSS, and TanStack Query for data fetching.

## Features

- **Serverless Backend**: Hono-based API with Durable Objects for per-entity storage (one DO per User/Chat).
- **Indexed Listing**: Efficient pagination of users and chats using prefix indexes.
- **Real-time Chat**: Messages stored directly in Chat Durable Objects.
- **Modern UI**: React 18, Vite, Tailwind CSS, shadcn/ui components, dark mode support.
- **Type-Safe**: Full TypeScript with shared types between frontend and worker.
- **Production-Ready**: CORS, error handling, logging, client error reporting.
- **Seeded Data**: Mock users, chats, and messages for instant demo.
- **SPA Routing**: React Router with error boundaries.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Lucide Icons, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects (GlobalDurableObject for multi-tenant storage).
- **Data**: SQLite-backed Durable Objects with CAS for concurrency, custom indexing.
- **Dev Tools**: Bun, ESLint, Wrangler.
- **Other**: Immer, Zod, React Hook Form, React Router.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for deployment)

### Installation

1. Clone or download the project.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Generate Worker types (if needed):
   ```bash
   bun run cf-typegen
   ```

### Local Development

1. Start the development server:
   ```bash
   bun dev
   ```
   - Frontend: http://localhost:3000 (Vite dev server)
   - API: Automatically proxied to Worker in dev mode.

2. Open http://localhost:3000 in your browser.

### Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start Vite dev server (frontend + Worker proxy) |
| `bun build` | Build for production |
| `bun preview` | Preview production build |
| `bun lint` | Run ESLint |
| `bun deploy` | Build + deploy to Cloudflare |

## Usage

### API Endpoints

All endpoints under `/api/`:

- **Users**:
  - `GET /api/users?cursor=&limit=` - List users (paginated)
  - `POST /api/users` - Create user `{ name: string }`
  - `DELETE /api/users/:id` - Delete user
  - `POST /api/users/deleteMany` - Delete many `{ ids: string[] }`

- **Chats**:
  - `GET /api/chats?cursor=&limit=` - List chats (paginated)
  - `POST /api/chats` - Create chat `{ title: string }`
  - `GET /api/chats/:chatId/messages` - List messages
  - `POST /api/chats/:chatId/messages` - Send message `{ userId: string, text: string }`
  - `DELETE /api/chats/:id` - Delete chat
  - `POST /api/chats/deleteMany` - Delete many `{ ids: string[] }`

- **Health**: `GET /api/health`
- **Errors**: `POST /api/client-errors` (for frontend error reporting)

Responses follow `{ success: boolean, data?: T, error?: string }`.

### Frontend Customization

- Replace `src/pages/HomePage.tsx` with your app UI.
- Use `src/lib/api-client.ts` for type-safe API calls.
- Components in `src/components/ui/` (shadcn).
- Hooks: `useTheme`, `useMobile`.
- Layout: `AppLayout` with sidebar (`src/components/layout/AppLayout.tsx`).

## Deployment

Deploy to Cloudflare Workers & Pages with one command:

```bash
bun deploy
```

This builds the frontend assets and deploys the Worker.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/supremazx/talku-ai-ai-voice-agent-management-platform)

### Manual Deployment Steps

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Deploy Worker**:
   ```bash
   wrangler deploy
   ```

3. **Custom Domain** (optional):
   Update `wrangler.toml` with your domain.

### Environment Variables

No env vars required. All storage uses Durable Objects (free tier sufficient for demos).

## Development Workflow

- **Add Entities**: Extend `worker/entities.ts` using `IndexedEntity` base class.
- **Add Routes**: Implement in `worker/user-routes.ts`, auto-loaded by `worker/index.ts`.
- **Shared Types**: Define in `shared/types.ts`.
- **Mock Data**: Update `shared/mock-data.ts` for seeding.
- **UI Components**: Use shadcn CLI: `bunx shadcn@latest add <component>`.

## Architecture

```
Cloudflare Workers (Hono API)
├── GlobalDurableObject (KV-like storage)
├── UserEntity (IndexedEntity<User>)
├── ChatBoardEntity (IndexedEntity<Chat + Messages>)
└── Indexes (sys-index for listing)

Frontend (React/Vite/SPA)
├── TanStack Query (API caching)
├── shadcn/ui + Tailwind
└── Assets served by Workers
```

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Install deps with `bun install`.
4. Commit changes.
5. Open a PR.

## License

MIT. See [LICENSE](LICENSE) for details.

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- File issues for bugs/features.